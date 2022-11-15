import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { Product, ProductImage } from './entities';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  controllers: [ProductsController],
  imports: [
    TypeOrmModule.forFeature([Product, ProductImage]),
    AuthModule,
  ],
  exports: [TypeOrmModule],
  providers: [ProductsService]
})
export class ProductsModule {}
