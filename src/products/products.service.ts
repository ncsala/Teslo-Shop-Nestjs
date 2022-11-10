import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { validate } from 'uuid';

import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductImage, Product } from './entities';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,

    @InjectRepository(ProductImage)
    private readonly productImageRepository: Repository<ProductImage>,

    private readonly dataSource: DataSource,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const { images = [], ...productDetails } = createProductDto;

      const product = this.productRepository.create({
        ...productDetails,
        images: images.map((imageURL) =>
          this.productImageRepository.create({ url: imageURL }),
        ),
      });

      await this.productRepository.save(product);

      return { ...product, images };
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    const products = await this.productRepository.find({
      take: limit,
      skip: offset,
      relations: {
        images: true,
      },
    });

    return products.map((product) => {
      return {
        ...product,
        images: product.images.map((img) => img.url),
      };
    });

    // Otra forma
    // return products.map(({ images, ...rest }) => {
    //   return {
    //     ...rest,
    //     images: images.map((img) => img.url),
    //   };
    // });
  }

  async findOne(term: string) {
    let product: Product;

    if (validate(term)) {
      // product = await this.productRepository.findOne({
      //   where: { id: term },
      //   relations: { images: true },
      // });
      // Como en la entidad products esta configurada la propiedad
      // 'eager: true' no es necesario especificar la relacion en los finds.
      // Sino quedaria como la consulta de arriba
      product = await this.productRepository.findOne({
        where: { id: term },
      });
    }

    if (!validate(term)) {
      const queryBuilder = this.productRepository.createQueryBuilder('prod');
      product = await queryBuilder
        // .where('title like :title or slug like :slug', {
        //   title: '%' + term + '%',
        //   slug: '%' + term + '%',
        // })
        .where(`UPPER(title) =:title or slug =:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .leftJoinAndSelect('prod.images', 'prodImages')
        .getOne();
    }

    if (!product) {
      throw new NotFoundException('No existe producto con ese ID!');
    }

    return product;
  }

  async findOnePlain(term: string) {
    const { images = [], ...rest } = await this.findOne(term);
    return {
      ...rest,
      images: images.map((img) => img.url),
    };
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const { images, ...toUpdate } = updateProductDto;
    // Busca en la base de datos y le "agrega" todas las propiedades
    // del updateProductDto
    const product = await this.productRepository.preload({
      id,
      ...toUpdate,
    });

    if (!product) {
      throw new NotFoundException('No se encontro ese producto!');
    }

    // Crear queryrunner. Basicamente lo utilizamos para crear una transaccion
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Se verifica si viene la propiedad images en el update
      if (images) {
        // Se borran las imagenes que haya hasta el momento
        await queryRunner.manager.delete(ProductImage, {
          product: { id },
        });

        // Se crean las instancias de las imagenes
        product.images = images.map((image) =>
          this.productImageRepository.create({ url: image }),
        );
      }

      // Se guarda todo
      await queryRunner.manager.save(product);

      // Si se pudo hacer todo lo anterior, recien ahi se hace el commit
      // y se finaliza la transaccion
      await queryRunner.commitTransaction();
      await queryRunner.release();

      // await this.productRepository.save(product);
      return this.findOnePlain(id);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const product = await this.findOne(id);
    await this.productRepository.remove(product);
    return product;
  }

  // Metodo privado para manejar excepciones
  private handleDBExceptions(error: any) {
    const errCode = error.code;
    if (errCode === '23502' || errCode === '23505')
      throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Error inesperado, checkee los logs del servidor',
    );
  }
}
