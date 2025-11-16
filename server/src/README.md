# Servidor - Estética Práctica

Este servicio Express se encarga de la autenticación, registro y recuperación de cuentas.

## Configuración de variables de entorno

Copia el archivo `.env` incluido y completa los valores:

```bash
cp .env .env.local
```

Edita `.env.local` con los datos reales y carga esas variables antes de arrancar el servidor (`npm run dev` o `npm start`).

### MongoDB
- `MONGODB_URI`: cadena de conexión de tu clúster de MongoDB Atlas.

### Firebase Admin (opcional, pero recomendado)
Sirve para autenticación con Google y para encolar correos si utilizas la extensión **Trigger Email**.
- `FIREBASE_PROJECT_ID`
- `FIREBASE_CLIENT_EMAIL`
- `FIREBASE_PRIVATE_KEY`: respeta los saltos de línea con `\n` si la defines desde variables de entorno.

### Envío de correos
Actualmente los correos se encolan en Firestore para que la extensión **Trigger Email** los procese y envíe.
Configura las credenciales de Firebase Admin para habilitar esta funcionalidad.

## Puesta en marcha

```bash
npm install
npm run dev
```

El servidor se inicia en el puerto definido por `PORT` (4000 por defecto).