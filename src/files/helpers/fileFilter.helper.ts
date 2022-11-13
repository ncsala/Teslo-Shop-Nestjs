export const fileFilter = (
  request: Express.Request,
  file: Express.Multer.File,
  cb: Function,
) => {
  // Basicamente con el callback se le dice q acepte o no el archivo
  
  // if (!file) return cb(new Error('El archivo esta vacio'), false);

  const fileExtension = file.mimetype.split('/')[1]
  const validExtensions = ['jpg', 'jpeg', 'png', 'gif', 'pdf', 'webp']

  // Si esta dentro de una de las extensiones validas
  // se acepta el archivo
  if (validExtensions.includes(fileExtension)) {
    return cb(null, true)
  }

  console.log('llegue')
  // Si no es una extension valida no acepta el archivo
  cb(null, false);
};
