import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

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

  async findAll() {
    return await this.productRepository.find();
  }

  async findOne(id: string) {
    // Otra forma de hacer lo mismo
    // return await this.productRepository.find({where: { id }});
    // this.productRepository.findOne({where: {id}})
    const product = await this.productRepository.findOneBy({ id });
    if (!product) {
      throw new NotFoundException('No existe producto con ese ID!');
    }
    return product;
  }

  update(id: number, updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  async remove(id: string) {
    const product = await this.findOne(id)
    await this.productRepository.remove(product)
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
