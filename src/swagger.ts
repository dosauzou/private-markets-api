export const swaggerDocument = {
  openapi: '3.0.0',
  info: {
    title: 'Private Markets API',
    version: '1.0.0',
    description: 'RESTful API for managing private market funds and investor commitments',
  },
  servers: [{ url: 'http://localhost:3000' }],
  tags: [
    { name: 'Health', description: 'Health check' },
    { name: 'Funds', description: 'Fund management operations' },
  ],
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
        },
      },
    },
    '/funds': {
      get: {
        summary: 'List all funds',
        tags: ['Funds'],
        responses: {
          200: {
            description: 'List of funds',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: {
                      type: 'array',
                      items: { '$ref': '#/components/schemas/Fund' },
                    },
                  },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new fund',
        tags: ['Funds'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/CreateFund' },
            },
          },
        },
        responses: {
          201: {
            description: 'Fund created',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { '$ref': '#/components/schemas/Fund' },
                  },
                },
              },
            },
          },
          400: { description: 'Invalid input' },
        },
      },
    },
    '/funds/{id}': {
      get: {
        summary: 'Get a specific fund',
        tags: ['Funds'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'Fund found',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { '$ref': '#/components/schemas/Fund' },
                  },
                },
              },
            },
          },
          404: { description: 'Fund not found' },
        },
      },
      put: {
        summary: 'Update an existing fund',
        tags: ['Funds'],
        parameters: [
          {
            name: 'id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/UpdateFund' },
            },
          },
        },
        responses: {
          200: {
            description: 'Fund updated',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: true },
                    data: { '$ref': '#/components/schemas/Fund' },
                  },
                },
              },
            },
          },
          404: { description: 'Fund not found' },
          400: { description: 'Invalid input' },
        },
      },
    },
  },
  components: {
    schemas: {
      Fund: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
          name: { type: 'string', example: 'Titanbay Growth Fund I' },
          vintage_year: { type: 'integer', example: 2024 },
          target_size_usd: { type: 'number', example: 250000000.00 },
          status: { type: 'string', enum: ['Fundraising', 'Investing', 'Closed'], example: 'Fundraising' },
          created_at: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
        },
      },
      CreateFund: {
        type: 'object',
        required: ['name', 'vintage_year', 'target_size_usd'],
        properties: {
          name: { type: 'string', example: 'Titanbay Growth Fund II' },
          vintage_year: { type: 'integer', example: 2025 },
          target_size_usd: { type: 'number', example: 500000000.00 },
          status: { type: 'string', enum: ['Fundraising', 'Investing', 'Closed'], example: 'Fundraising' },
        },
      },
      UpdateFund: {
        type: 'object',
        properties: {
          name: { type: 'string', example: 'Titanbay Growth Fund I' },
          vintage_year: { type: 'integer', example: 2024 },
          target_size_usd: { type: 'number', example: 300000000.00 },
          status: { type: 'string', enum: ['Fundraising', 'Investing', 'Closed'], example: 'Investing' },
        },
      },
    },
  },
}
