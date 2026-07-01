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
    { name: 'Investors', description: 'Investor management operations' },
    { name: 'Investments', description: 'Investment management operations' },
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
                        environment: { type: 'string', example: 'production' },
                        uptime_seconds: { type: 'integer', example: 3600 },
                        db: {
                          type: 'object',
                          properties: {
                            status: { type: 'string', example: 'connected' },
                          },
                        },
                        server_time: { type: 'string', format: 'date-time', example: '2024-01-15T10:30:00Z' },
                      },
                    },
                  },
                },
              },
            },
          },
          503: {
            description: 'Database unreachable',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    success: { type: 'boolean', example: false },
                    error: { type: 'string', example: 'Database unreachable' },
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
        parameters: [
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 1000, default: 1 },
            description: 'Page number',
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 100, default: 20 },
            description: 'Number of results per page',
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['Fundraising', 'Investing', 'Closed'] },
            description: 'Filter by fund status',
          },
          {
            name: 'vintage_year',
            in: 'query',
            schema: { type: 'integer', minimum: 1900, maximum: 2100 },
            description: 'Filter by vintage year',
          },
          {
            name: 'search',
            in: 'query',
            schema: { type: 'string', minLength: 3 },
            description: 'Search funds by name (minimum 3 characters)',
          },
        ],
        responses: {
          200: {
            description: 'List of funds',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { '$ref': '#/components/schemas/Fund' },
                },
              },
            },
          },
          400: { description: 'Invalid query parameters' },
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
                schema: { '$ref': '#/components/schemas/Fund' },
              },
            },
          },
          400: { description: 'Invalid input' },
        },
      },
      put: {
        summary: 'Update an existing fund',
        tags: ['Funds'],
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
                schema: { '$ref': '#/components/schemas/Fund' },
              },
            },
          },
          404: { description: 'Fund not found' },
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
                schema: { '$ref': '#/components/schemas/Fund' },
              },
            },
          },
          404: { description: 'Fund not found' },
        },
      },
    },
    '/investors': {
      get: {
        summary: 'List all investors',
        tags: ['Investors'],
        responses: {
          200: {
            description: 'List of investors',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { '$ref': '#/components/schemas/Investor' },
                },
              },
            },
          },
        },
      },
      post: {
        summary: 'Create a new investor',
        tags: ['Investors'],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/CreateInvestor' },
            },
          },
        },
        responses: {
          201: {
            description: 'Investor created',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/Investor' },
              },
            },
          },
          400: { description: 'Invalid input' },
          409: { description: 'Investor with this email already exists' },
        },
      },
    },
    '/funds/{fund_id}/investments': {
      get: {
        summary: 'List all investments for a fund',
        tags: ['Investments'],
        parameters: [
          {
            name: 'fund_id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        responses: {
          200: {
            description: 'List of investments',
            content: {
              'application/json': {
                schema: {
                  type: 'array',
                  items: { '$ref': '#/components/schemas/Investment' },
                },
              },
            },
          },
          404: { description: 'Fund not found' },
        },
      },
      post: {
        summary: 'Create a new investment for a fund',
        tags: ['Investments'],
        parameters: [
          {
            name: 'fund_id',
            in: 'path',
            required: true,
            schema: { type: 'string', format: 'uuid' },
          },
        ],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { '$ref': '#/components/schemas/CreateInvestment' },
            },
          },
        },
        responses: {
          201: {
            description: 'Investment created',
            content: {
              'application/json': {
                schema: { '$ref': '#/components/schemas/Investment' },
              },
            },
          },
          400: { description: 'Invalid input' },
          404: { description: 'Fund or investor not found' },
          409: { description: 'Investor has already committed to this fund' },
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
        required: ['id'],
        properties: {
          id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
          name: { type: 'string', example: 'Titanbay Growth Fund I' },
          vintage_year: { type: 'integer', example: 2024 },
          target_size_usd: { type: 'number', example: 300000000.00 },
          status: { type: 'string', enum: ['Fundraising', 'Investing', 'Closed'], example: 'Investing' },
        },
      },
      Investor: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '770e8400-e29b-41d4-a716-446655440002' },
          name: { type: 'string', example: 'Goldman Sachs Asset Management' },
          email: { type: 'string', format: 'email', example: 'investments@gsam.com' },
          investor_type: { type: 'string', enum: ['Individual', 'Institution', 'FamilyOffice'], example: 'Institution' },
          created_at: { type: 'string', format: 'date-time', example: '2024-02-10T09:15:00Z' },
        },
      },
      CreateInvestor: {
        type: 'object',
        required: ['name', 'email', 'investor_type'],
        properties: {
          name: { type: 'string', example: 'CalPERS' },
          email: { type: 'string', format: 'email', example: 'privateequity@calpers.ca.gov' },
          investor_type: { type: 'string', enum: ['Individual', 'Institution', 'FamilyOffice'], example: 'Institution' },
        },
      },
      Investment: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid', example: '990e8400-e29b-41d4-a716-446655440004' },
          fund_id: { type: 'string', format: 'uuid', example: '550e8400-e29b-41d4-a716-446655440000' },
          investor_id: { type: 'string', format: 'uuid', example: '770e8400-e29b-41d4-a716-446655440002' },
          amount_usd: { type: 'number', example: 50000000.00 },
          investment_date: { type: 'string', format: 'date', example: '2024-03-15' },
          created_at: { type: 'string', format: 'date-time', example: '2024-03-15T10:00:00Z' },
        },
      },
      CreateInvestment: {
        type: 'object',
        required: ['investor_id', 'amount_usd', 'investment_date'],
        properties: {
          investor_id: { type: 'string', format: 'uuid', example: '770e8400-e29b-41d4-a716-446655440002' },
          amount_usd: { type: 'number', example: 50000000.00 },
          investment_date: { type: 'string', format: 'date', example: '2024-03-15' },
        },
      },
    },
  },
}
