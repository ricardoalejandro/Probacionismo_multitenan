import { FastifyPluginAsync } from 'fastify';
import { getSMTPConfig, saveSMTPConfig, testSMTPConnection } from '../services/emailService';
import { generateTestData, deleteTestData, getTestDataStats } from '../services/testDataService';
import { z } from 'zod';

const smtpConfigSchema = z.object({
  host: z.string().min(1, 'El host es requerido'),
  port: z.number().min(1).max(65535),
  secure: z.boolean(), // true = SSL, false = TLS
  auth: z.object({
    user: z.string().email('Email inválido'),
    pass: z.string().min(1, 'La contraseña es requerida'),
  }),
  from: z.object({
    name: z.string().min(1, 'El nombre del remitente es requerido'),
    address: z.string().email('Email del remitente inválido'),
  }),
});

const generateTestDataSchema = z.object({
  branchId: z.string().uuid('ID de sucursal inválido'),
  studentsCount: z.number().min(1).max(100).default(10),
  coursesCount: z.number().min(1).max(15).default(5),
  instructorsCount: z.number().min(1).max(20).default(3),
});

export const systemRoutes: FastifyPluginAsync = async (fastify) => {

  // GET /api/system/config/smtp - Obtener configuración SMTP (ofuscada)
  fastify.get('/config/smtp', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const currentUser = (request.user as any);

    if (currentUser.userType !== 'admin') {
      return reply.code(403).send({ error: 'No tienes permiso para ver la configuración' });
    }

    try {
      const config = await getSMTPConfig();

      if (!config) {
        return { configured: false, config: null };
      }

      // Ofuscar la contraseña
      const safeConfig = {
        ...config,
        auth: {
          ...config.auth,
          pass: '••••••••', // No revelar la contraseña
        },
      };

      return { configured: true, config: safeConfig };

    } catch (error) {
      console.error('Error al obtener config SMTP:', error);
      return reply.code(500).send({ error: 'Error al obtener configuración' });
    }
  });

  // POST /api/system/config/smtp - Guardar configuración SMTP
  fastify.post('/config/smtp', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const currentUser = (request.user as any);

    if (currentUser.userType !== 'admin') {
      return reply.code(403).send({ error: 'No tienes permiso para modificar la configuración' });
    }

    try {
      const config = smtpConfigSchema.parse(request.body);

      const success = await saveSMTPConfig(config, currentUser.userId);

      if (!success) {
        return reply.code(500).send({ error: 'Error al guardar la configuración' });
      }

      return { message: 'Configuración SMTP guardada correctamente' };

    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Datos inválidos', details: error.errors });
      }
      console.error('Error al guardar config SMTP:', error);
      return reply.code(500).send({ error: 'Error al guardar configuración' });
    }
  });

  // POST /api/system/config/smtp/test - Probar conexión SMTP
  fastify.post('/config/smtp/test', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const currentUser = (request.user as any);

    if (currentUser.userType !== 'admin') {
      return reply.code(403).send({ error: 'No tienes permiso' });
    }

    try {
      const result = await testSMTPConnection();

      if (result.success) {
        return { success: true, message: result.message };
      } else {
        return reply.code(400).send({ success: false, message: result.message });
      }

    } catch (error: any) {
      console.error('Error al probar SMTP:', error);
      return reply.code(500).send({
        success: false,
        message: `Error al probar conexión: ${error.message}`
      });
    }
  });

  // ============================================
  // RUTAS DE DATOS DE PRUEBA
  // ============================================

  // GET /api/system/test-data/stats - Obtener estadísticas de datos de prueba
  fastify.get('/test-data/stats', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const currentUser = (request.user as any);

    if (currentUser.userType !== 'admin') {
      return reply.code(403).send({ error: 'No tienes permiso para esta acción' });
    }

    try {
      const { branchId } = request.query as { branchId?: string };
      const stats = await getTestDataStats(branchId);
      return { data: stats };
    } catch (error) {
      console.error('Error al obtener estadísticas:', error);
      return reply.code(500).send({ error: 'Error al obtener estadísticas' });
    }
  });

  // POST /api/system/test-data/generate - Generar datos de prueba
  fastify.post('/test-data/generate', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const currentUser = (request.user as any);

    if (currentUser.userType !== 'admin') {
      return reply.code(403).send({ error: 'No tienes permiso para esta acción' });
    }

    try {
      const options = generateTestDataSchema.parse(request.body);
      const result = await generateTestData(options);

      return {
        message: 'Datos de prueba generados correctamente',
        data: result
      };
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return reply.code(400).send({ error: 'Datos inválidos', details: error.errors });
      }
      console.error('Error al generar datos de prueba:', error);
      return reply.code(500).send({ error: error.message || 'Error al generar datos de prueba' });
    }
  });

  // DELETE /api/system/test-data - Eliminar datos de prueba
  fastify.delete('/test-data', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const currentUser = (request.user as any);

    if (currentUser.userType !== 'admin') {
      return reply.code(403).send({ error: 'No tienes permiso para esta acción' });
    }

    try {
      const { branchId } = request.query as { branchId?: string };
      const result = await deleteTestData(branchId);

      return {
        message: 'Datos de prueba eliminados correctamente',
        data: result
      };
    } catch (error: any) {
      console.error('Error al eliminar datos de prueba:', error);
      return reply.code(500).send({ error: error.message || 'Error al eliminar datos de prueba' });
    }
  });

  // ============================================
  // RUTAS DE CONFIGURACIÓN DE TOKENS
  // ============================================

  // GET /api/system/config/tokens - Obtener configuración de tokens
  fastify.get('/config/tokens', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const currentUser = (request.user as any);

    if (currentUser.userType !== 'admin') {
      return reply.code(403).send({ error: 'No tienes permiso para ver la configuración' });
    }

    try {
      const { db } = await import('../db');
      const { systemConfig } = await import('../db/schema');
      const { eq } = await import('drizzle-orm');

      const [config] = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, 'dni_validation_token'))
        .limit(1);

      if (!config) {
        return { configured: false, token: null };
      }

      // Ofuscar el token (mostrar solo últimos 4 caracteres)
      const tokenValue = config.configValue;
      const maskedToken = tokenValue.length > 4
        ? '•'.repeat(tokenValue.length - 4) + tokenValue.slice(-4)
        : '••••';

      return {
        configured: true,
        token: maskedToken,
        updatedAt: config.updatedAt
      };

    } catch (error) {
      console.error('Error al obtener config de tokens:', error);
      return reply.code(500).send({ error: 'Error al obtener configuración' });
    }
  });

  // POST /api/system/config/tokens - Guardar token de consulta DNI
  fastify.post('/config/tokens', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    const currentUser = (request.user as any);

    if (currentUser.userType !== 'admin') {
      return reply.code(403).send({ error: 'No tienes permiso para modificar la configuración' });
    }

    try {
      const { dniToken } = request.body as { dniToken: string };

      if (!dniToken || dniToken.trim().length === 0) {
        return reply.code(400).send({ error: 'El token es requerido' });
      }

      const { db } = await import('../db');
      const { systemConfig } = await import('../db/schema');
      const { eq } = await import('drizzle-orm');

      // Verificar si ya existe
      const [existing] = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, 'dni_validation_token'))
        .limit(1);

      if (existing) {
        // Actualizar
        await db
          .update(systemConfig)
          .set({
            configValue: dniToken.trim(),
            updatedAt: new Date(),
            updatedBy: currentUser.userId
          })
          .where(eq(systemConfig.configKey, 'dni_validation_token'));
      } else {
        // Crear
        await db.insert(systemConfig).values({
          configKey: 'dni_validation_token',
          configValue: dniToken.trim(),
          isEncrypted: false,
          updatedBy: currentUser.userId
        });
      }

      return { message: 'Token guardado correctamente' };

    } catch (error: any) {
      console.error('Error al guardar token:', error);
      return reply.code(500).send({ error: 'Error al guardar el token' });
    }
  });

  // GET /api/system/validate-dni/:dni - Proxy para validar DNI con API externa
  fastify.get('/validate-dni/:dni', {
    onRequest: [fastify.authenticate],
  }, async (request, reply) => {
    try {
      const { dni } = request.params as { dni: string };

      // Validar formato de DNI
      if (!/^\d{8}$/.test(dni)) {
        return reply.code(400).send({
          success: false,
          error: 'El DNI debe tener exactamente 8 dígitos numéricos'
        });
      }

      const { db } = await import('../db');
      const { systemConfig } = await import('../db/schema');
      const { eq } = await import('drizzle-orm');

      // Obtener token configurado
      const [config] = await db
        .select()
        .from(systemConfig)
        .where(eq(systemConfig.configKey, 'dni_validation_token'))
        .limit(1);

      if (!config || !config.configValue) {
        return reply.code(400).send({
          success: false,
          error: 'No se ha configurado el token de consulta de DNIs. Configure el token en el panel de administración.'
        });
      }

      // Llamar a la API externa (HTTPS para evitar pérdida de headers en redirect)
      const apiUrl = `https://personas.naperu.cloud/api/persona/${dni}`;

      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${config.configValue}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error de API externa:', response.status, errorText);

        if (response.status === 401) {
          return reply.code(401).send({
            success: false,
            error: 'Token de consulta inválido o expirado. Verifique la configuración del token.'
          });
        }

        if (response.status === 404) {
          return reply.code(404).send({
            success: false,
            error: 'No se encontró información para este DNI'
          });
        }

        return reply.code(response.status).send({
          success: false,
          error: `Error al consultar el DNI: ${errorText || 'Error desconocido'}`
        });
      }

      const data: any = await response.json();

      // Verificar respuesta de la API
      if (!data.success) {
        return reply.code(400).send({
          success: false,
          error: data.message || 'Error al consultar el DNI'
        });
      }

      // Mapear respuesta según formato de la API
      return {
        success: true,
        data: {
          dni: data.data?.nrodoc || dni,
          nombres: data.data?.nombres || '',
          apellidoPaterno: data.data?.apellido_paterno || '',
          apellidoMaterno: data.data?.apellido_materno || '',
        }
      };

    } catch (error: any) {
      console.error('Error al validar DNI:', error);
      return reply.code(500).send({
        success: false,
        error: `Error al consultar el servicio: ${error.message}`
      });
    }
  });
};
