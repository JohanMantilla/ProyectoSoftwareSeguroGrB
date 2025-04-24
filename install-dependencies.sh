#!/bin/bash

# Ruta base del proyecto
BASE_DIR="/Users/santiago/Documents/ultimo-semestre/software seguro/Proyecto-2B"

# Iterar sobre cada subcarpeta dentro del directorio
for dir in "$BASE_DIR"/*; do
  # Obtener el nombre de la carpeta actual
  folder_name=$(basename "$dir")

  # Excluir client-gateway y notification-ms
  if [[ "$folder_name" == "client-gateway" || "$folder_name" == "notification-ms" ]]; then
    echo "Saltando $folder_name..."
    continue
  fi

  if [ -d "$dir" ]; then
    echo "Entrando a $dir..."
    cd "$dir" || exit

    # Verificar si existe un package.json antes de instalar
    if [ -f "package.json" ]; then
      echo "Instalando dependencias en $folder_name..."
      # Instalar las dependencias necesarias
      #npm install nats 
      #npm install dotenv 
      #npm install joi 
      #npm install class-transformer 
      #npm install class-validator 
      #npm install @nestjs/microservices@10.4.4 
      #npm install @prisma/client
      #npm install -D prisma

      npx prisma init
    else
      echo "No se encontró package.json en $folder_name. Saltando..."
    fi

    # Regresar a la ruta base
    cd "$BASE_DIR" || exit
  fi
done

echo "Proceso completado."
