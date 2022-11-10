import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductImage } from './entities';

@Module({
  controllers: [ProductsController],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage])
  ],
  providers: [ProductsService]
})
export class ProductsModule {}
