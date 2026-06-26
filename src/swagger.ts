export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Private Markets API',
    version: '1.0.0',
    description: 'RESTful API for managing private market funds and investor commitments',
  },
  servers: [{ url: 'http://localhost:3000' }],
  paths: {
    '/api/health': {
      get: {
        summary: 'Health check',
        tags: ['Health'],
        responses: {
          200: {
            description: 'Server and database are healthy',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'object',
                      properties: {
                        status: { type: 'string', example: 'ok' },
                        db: { type: 'string', example: 'connected' },
                      },
                    },
                  },
                },
              },
            },
          },
          503: {
            description: 'Database unreachable',
          },
        },
      },
    },
  },
}
