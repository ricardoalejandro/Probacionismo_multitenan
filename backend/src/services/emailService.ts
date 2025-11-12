import nodemailer from 'nodemailer';
import { db } from '../db';
import { systemConfig } from '../db/schema';
import { eq } from 'drizzle-orm';
import crypto from 'crypto';

interface SMTPConfig {
  host: string;
  port: number;
  secure: boolean; // true para SSL, false para TLS
  auth: {
    user: string;
    pass: string;
  };
  from: {
    name: string;
    address: string;
  };
}

/**
 * Obtener configuración SMTP desde la base de datos
 */
export async function getSMTPConfig(): Promise<SMTPConfig | null> {
  try {
    const configs = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.configKey, 'smtp_config'));

    if (configs.length === 0) {
      return null;
    }

    const config = JSON.parse(configs[0].configValue);
    return config;
  } catch (error) {
    console.error('Error al obtener config SMTP:', error);
    return null;
  }
}

/**
 * Guardar configuración SMTP en la base de datos
 */
export async function saveSMTPConfig(config: SMTPConfig, userId: string) {
  try {
    // Encriptar la contraseña antes de guardar (simple base64 para este ejemplo)
    const encryptedConfig = {
      ...config,
      auth: {
        ...config.auth,
        pass: Buffer.from(config.auth.pass).toString('base64'),
      },
    };

    const configValue = JSON.stringify(encryptedConfig);

    // Verificar si ya existe
    const [existing] = await db
      .select()
      .from(systemConfig)
      .where(eq(systemConfig.configKey, 'smtp_config'))
      .limit(1);

    if (existing) {
      // Actualizar
      await db
        .update(systemConfig)
        .set({
          configValue,
          isEncrypted: true,
          updatedAt: new Date(),
          updatedBy: userId,
        })
        .where(eq(systemConfig.configKey, 'smtp_config'));
    } else {
      // Insertar
      await db.insert(systemConfig).values({
        configKey: 'smtp_config',
        configValue,
        isEncrypted: true,
        updatedBy: userId,
      });
    }

    return true;
  } catch (error) {
    console.error('Error al guardar config SMTP:', error);
    return false;
  }
}

/**
 * Desencriptar la contraseña SMTP
 */
function decryptPassword(encrypted: string): string {
  try {
    return Buffer.from(encrypted, 'base64').toString('utf-8');
  } catch (error) {
    return encrypted; // Si falla, asumir que no está encriptada
  }
}

/**
 * Crear transporter de nodemailer
 */
async function createTransporter() {
  const config = await getSMTPConfig();

  if (!config) {
    throw new Error('Configuración SMTP no encontrada. Por favor configura el servidor de email.');
  }

  // Desencriptar password
  const decryptedPass = decryptPassword(config.auth.pass);

  const transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth.user,
      pass: decryptedPass,
    },
  });

  return { transporter, config };
}

/**
 * Probar conexión SMTP
 */
export async function testSMTPConnection(): Promise<{ success: boolean; message: string }> {
  try {
    const { transporter } = await createTransporter();
    await transporter.verify();
    return { success: true, message: 'Conexión exitosa al servidor SMTP' };
  } catch (error: any) {
    console.error('Error en test SMTP:', error);
    return { 
      success: false, 
      message: `Error de conexión: ${error.message}` 
    };
  }
}

/**
 * Enviar email de reseteo de contraseña
 */
export async function sendPasswordResetEmail(
  to: string,
  username: string,
  resetToken: string,
  frontendUrl: string = 'http://localhost:5000'
) {
  try {
    const { transporter, config } = await createTransporter();

    const resetLink = `${frontendUrl}/reset-password?token=${resetToken}`;

    const mailOptions = {
      from: {
        name: config.from.name,
        address: config.from.address,
      },
      to,
      subject: 'Restablecer contraseña - Sistema Escolástica',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              line-height: 1.6;
              color: #333;
            }
            .container {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .header {
              background-color: #4f46e5;
              color: white;
              padding: 20px;
              text-align: center;
              border-radius: 8px 8px 0 0;
            }
            .content {
              background-color: #f9fafb;
              padding: 30px;
              border: 1px solid #e5e7eb;
            }
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #4f46e5;
              color: white;
              text-decoration: none;
              border-radius: 6px;
              margin: 20px 0;
            }
            .footer {
              text-align: center;
              padding: 20px;
              color: #6b7280;
              font-size: 14px;
            }
            .warning {
              background-color: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 12px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎓 Sistema Escolástica</h1>
            </div>
            <div class="content">
              <h2>Restablecer Contraseña</h2>
              <p>Hola <strong>${username}</strong>,</p>
              <p>Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.</p>
              <p>Haz clic en el siguiente botón para crear una nueva contraseña:</p>
              <p style="text-align: center;">
                <a href="${resetLink}" class="button">Restablecer Contraseña</a>
              </p>
              <p>O copia y pega este enlace en tu navegador:</p>
              <p style="word-break: break-all; background-color: #e5e7eb; padding: 10px; border-radius: 4px;">
                ${resetLink}
              </p>
              <div class="warning">
                <strong>⚠️ Importante:</strong> Este enlace es válido por <strong>1 hora</strong> y solo puede usarse una vez.
              </div>
              <p>Si no solicitaste este cambio, puedes ignorar este correo de forma segura.</p>
            </div>
            <div class="footer">
              <p>Este es un correo automático, por favor no respondas a este mensaje.</p>
              <p>&copy; ${new Date().getFullYear()} Sistema Escolástica. Todos los derechos reservados.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Restablecer Contraseña - Sistema Escolástica
        
        Hola ${username},
        
        Hemos recibido una solicitud para restablecer la contraseña de tu cuenta.
        
        Usa el siguiente enlace para crear una nueva contraseña (válido por 1 hora):
        ${resetLink}
        
        Si no solicitaste este cambio, puedes ignorar este correo de forma segura.
        
        ---
        Sistema Escolástica
      `,
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
}

/**
 * Generar token aleatorio seguro
 */
export function generateResetToken(): string {
  return crypto.randomBytes(32).toString('hex');
}
