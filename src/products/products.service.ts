import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { validate } from 'uuid';

import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  private readonly logger = new Logger('ProductsService');

  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto) {
    try {
      const product = this.productRepository.create(createProductDto);

      await this.productRepository.save(product);

      return product;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = 10, offset = 0 } = paginationDto;

    return await this.productRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(term: string) {
    let product: Product;

    if (validate(term)) {
      product = await this.productRepository.findOne({ where: { id: term } });
    }

    if (!validate(term)) {
      const queryBuilder = this.productRepository.createQueryBuilder();
      product = await queryBuilder
        // .where('title like :title or slug like :slug', {
        //   title: '%' + term + '%',
        //   slug: '%' + term + '%',
        // })
        .where(`UPPER(title) =:title or slug =:slug`, {
          title: term.toUpperCase(),
          slug: term.toLowerCase(),
        })
        .getOne();
    }

    // const product = await this.productRepository.findOneBy({ id: term });
    // Otra forma de hacer lo mismo
    // const product = await this.productRepository.find({where: { id }});
    // const product = await this.productRepository.findOne({where: {id}})
    if (!product) {
      throw new NotFoundException('No existe producto con ese ID!');
    }
    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    // Busca en la base de datos y le "agrega" todas las propiedades
    // del updateProductDto
    const product = await this.productRepository.preload({
      id,
      ...updateProductDto,
    });
    if (!product) {
      throw new NotFoundException('No se encontro ese producto!');
    }

    try {
      await this.productRepository.save(product);
      return product;
    } catch (error) {
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
    if (error.code === '23502') throw new BadRequestException(error.detail);

    this.logger.error(error);

    throw new InternalServerErrorException(
      'Error inesperado, checkee los logs del servidor',
    );
  }
}
