import { v4 as uuid } from 'uuid';

export const fileNamer = (
  request: Express.Request,
  file: Express.Multer.File,
  cb: Function,
) => {
  // Basicamente con el callback se le dice q acepte o no el archivo

  // if (!file) return cb(new Error('El archivo esta vacio'), false);
  const fileExtension = file.mimetype.split('/')[1];

  const fileName = `${uuid()}.${fileExtension}`;

  cb(null, fileName);
};
