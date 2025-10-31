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

### Envío directo con Gmail
Si prefieres que los correos de recuperación lleguen desde Gmail sin depender de Firebase:
1. Activa la verificación en dos pasos de tu cuenta de Google.
2. Genera una [contraseña de aplicación](https://myaccount.google.com/apppasswords) para "Correo" y "Otro".
3. Define las variables:
   - `GMAIL_USER`: tu dirección de Gmail (por ejemplo, `mi.estetica@gmail.com`).
   - `GMAIL_APP_PASSWORD`: la contraseña de aplicación generada en el paso anterior.
4. (Opcional) `GMAIL_DEFAULT_FROM`: personaliza el nombre del remitente. Debe mantener el mismo correo que `GMAIL_USER` para evitar bloqueos.

El servicio intentará primero encolar el correo en Firebase. Si no encuentra una configuración válida, enviará el mensaje usando Gmail y Nodemailer.

## Puesta en marcha

```bash
npm install
npm run dev
```

El servidor se inicia en el puerto definido por `PORT` (4000 por defecto).