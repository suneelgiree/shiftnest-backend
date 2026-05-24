import swaggerJsdoc from 'swagger-jsdoc';

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'ShiftNest API',
      version: '1.0.0',
      description: 'Nepal\'s end-to-end platform for verified room listings and professional shifting services',
      contact: {
        name: 'Suneel Giri',
        email: 'suneel@shiftnest.com',
      },
    },
    servers: [
      { url: 'http://localhost:3000', description: 'Development server' },
      { url: 'https://api.shiftnest.app', description: 'Production server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT access token',
        },
      },
      schemas: {
        // Auth
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password', 'firstName', 'lastName'],
          properties: {
            email:     { type: 'string', example: 'user@shiftnest.com' },
            password:  { type: 'string', example: 'Test1234!' },
            firstName: { type: 'string', example: 'Ram' },
            lastName:  { type: 'string', example: 'Sharma' },
            phone:     { type: 'string', example: '9841234567' },
            role:      { type: 'string', enum: ['user', 'owner'], example: 'user' },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email:    { type: 'string', example: 'user@shiftnest.com' },
            password: { type: 'string', example: 'Test1234!' },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            accessToken:  { type: 'string' },
            refreshToken: { type: 'string' },
            user: {
              type: 'object',
              properties: {
                id:        { type: 'string' },
                email:     { type: 'string' },
                firstName: { type: 'string' },
                lastName:  { type: 'string' },
                role:      { type: 'string' },
              },
            },
          },
        },
        // Room
        RoomCreateRequest: {
          type: 'object',
          required: ['title', 'description', 'price', 'location', 'city', 'roomType'],
          properties: {
            title:       { type: 'string', example: '1BHK Room in Lazimpat' },
            description: { type: 'string', example: 'Beautiful room with WiFi' },
            price:       { type: 'number', example: 12000 },
            location:    { type: 'string', example: 'Lazimpat' },
            city:        { type: 'string', example: 'Kathmandu' },
            roomType:    { type: 'string', enum: ['1RK', '1BHK', '2BHK', 'FLAT'], example: '1BHK' },
            bedrooms:    { type: 'number', example: 1 },
            bathrooms:   { type: 'number', example: 1 },
            facilities:  { type: 'array', items: { type: 'string' }, example: ['WIFI', 'KITCHEN'] },
          },
        },
        // Shift estimate
        FareEstimateRequest: {
          type: 'object',
          required: ['vehicleType'],
          properties: {
            vehicleType: { type: 'string', enum: ['PICKUP', 'TATA_ACE', 'TRUCK'], example: 'TATA_ACE' },
            helpers:     { type: 'number', example: 2 },
          },
        },
        // Shift book
        ShiftBookRequest: {
          type: 'object',
          required: ['vehicleType', 'fromLocation', 'toLocation', 'moveDate'],
          properties: {
            vehicleType:   { type: 'string', enum: ['PICKUP', 'TATA_ACE', 'TRUCK'] },
            fromLocation:  { type: 'string', example: 'Lazimpat, Kathmandu' },
            toLocation:    { type: 'string', example: 'Maitidevi, Kathmandu' },
            moveDate:      { type: 'string', example: '2026-06-01' },
            helpers:       { type: 'number', example: 2 },
            notes:         { type: 'string', example: 'Handle with care' },
          },
        },
        // Payment
        PaymentInitiateRequest: {
          type: 'object',
          required: ['bookingRef', 'bookingType', 'method'],
          properties: {
            bookingRef:  { type: 'string', example: 'RM00001' },
            bookingType: { type: 'string', enum: ['ROOM_BOOKING', 'SHIFT_BOOKING'] },
            method:      { type: 'string', enum: ['KHALTI', 'ESEWA'] },
          },
        },
        // API Response wrapper
        ApiResponse: {
          type: 'object',
          properties: {
            success:   { type: 'boolean' },
            message:   { type: 'string' },
            data:      { type: 'object' },
            timestamp: { type: 'string' },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      { name: 'Auth',           description: 'Authentication endpoints' },
      { name: 'Rooms',          description: 'Room listings' },
      { name: 'Bookings',       description: 'Room bookings' },
      { name: 'Saved',          description: 'Saved rooms' },
      { name: 'Shift Bookings', description: 'Moving service bookings' },
      { name: 'Payments',       description: 'Khalti and eSewa payments' },
      { name: 'Reviews',        description: 'Room and driver reviews' },
      { name: 'Admin',          description: 'Admin management endpoints' },
    ],
    paths: {
      // AUTH
      '/api/auth/register': {
        post: {
          tags: ['Auth'], summary: 'Register a new user',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/RegisterRequest' } } } },
          responses: { '201': { description: 'Registration successful' }, '409': { description: 'Email already registered' } },
        },
      },
      '/api/auth/login': {
        post: {
          tags: ['Auth'], summary: 'Login',
          security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/LoginRequest' } } } },
          responses: { '200': { description: 'Login successful', content: { 'application/json': { schema: { '$ref': '#/components/schemas/AuthResponse' } } } } },
        },
      },
      '/api/auth/refresh-token': {
        post: { tags: ['Auth'], summary: 'Refresh access token', security: [],
          requestBody: { required: true, content: { 'application/json': { schema: { type: 'object', properties: { refreshToken: { type: 'string' } } } } } },
          responses: { '200': { description: 'Token refreshed' } },
        },
      },
      '/api/auth/me': {
        get:  { tags: ['Auth'], summary: 'Get my profile', responses: { '200': { description: 'Profile fetched' } } },
        put:  { tags: ['Auth'], summary: 'Update my profile', responses: { '200': { description: 'Profile updated' } } },
      },
      // ROOMS
      '/api/rooms': {
        get:  { tags: ['Rooms'], summary: 'List rooms with filters', security: [],
          parameters: [
            { in: 'query', name: 'city',     schema: { type: 'string' } },
            { in: 'query', name: 'minPrice', schema: { type: 'number' } },
            { in: 'query', name: 'maxPrice', schema: { type: 'number' } },
            { in: 'query', name: 'roomType', schema: { type: 'string' } },
            { in: 'query', name: 'page',     schema: { type: 'number' } },
            { in: 'query', name: 'limit',    schema: { type: 'number' } },
          ],
          responses: { '200': { description: 'Rooms fetched' } },
        },
        post: { tags: ['Rooms'], summary: 'Create a room listing (owner only)',
          requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/RoomCreateRequest' } } } },
          responses: { '201': { description: 'Room created' } },
        },
      },
      '/api/rooms/popular-areas':  { get: { tags: ['Rooms'], summary: 'Get popular areas', security: [], responses: { '200': { description: 'Areas fetched' } } } },
      '/api/rooms/recommended':    { get: { tags: ['Rooms'], summary: 'Get recommended rooms', security: [], responses: { '200': { description: 'Rooms fetched' } } } },
      '/api/rooms/{id}': {
        get:    { tags: ['Rooms'], summary: 'Get room detail', security: [], parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Room fetched' } } },
        put:    { tags: ['Rooms'], summary: 'Update room (owner only)', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Room updated' } } },
        delete: { tags: ['Rooms'], summary: 'Delete room (owner only)', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Room deleted' } } },
      },
      '/api/rooms/{id}/images': {
        post: { tags: ['Rooms'], summary: 'Upload room images',
          parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }],
          requestBody: { required: true, content: { 'multipart/form-data': { schema: { type: 'object', properties: { images: { type: 'array', items: { type: 'string', format: 'binary' } } } } } } },
          responses: { '201': { description: 'Images uploaded' } },
        },
      },
      // BOOKINGS
      '/api/rooms/bookings': {
        post: { tags: ['Bookings'], summary: 'Book a room (NPR 500)', responses: { '201': { description: 'Room booked' } } },
      },
      '/api/rooms/bookings/my': { get: { tags: ['Bookings'], summary: 'My room bookings', responses: { '200': { description: 'Bookings fetched' } } } },
      '/api/rooms/bookings/{id}/cancel': { put: { tags: ['Bookings'], summary: 'Cancel a booking', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Booking cancelled' } } } },
      // SAVED
      '/api/rooms/saved': { get: { tags: ['Saved'], summary: 'Get saved rooms', responses: { '200': { description: 'Saved rooms fetched' } } } },
      '/api/rooms/saved/{roomId}': {
        post:   { tags: ['Saved'], summary: 'Save a room', parameters: [{ in: 'path', name: 'roomId', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Room saved' } } },
        delete: { tags: ['Saved'], summary: 'Unsave a room', parameters: [{ in: 'path', name: 'roomId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Room removed' } } },
      },
      // SHIFT BOOKINGS
      '/api/shift-bookings/vehicles': { get: { tags: ['Shift Bookings'], summary: 'Get available vehicles', security: [], responses: { '200': { description: 'Vehicles fetched' } } } },
      '/api/shift-bookings/estimate': {
        post: { tags: ['Shift Bookings'], summary: 'Get fare estimate',
          requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/FareEstimateRequest' } } } },
          responses: { '200': { description: 'Fare estimated' } },
        },
      },
      '/api/shift-bookings/book': {
        post: { tags: ['Shift Bookings'], summary: 'Book a shift',
          requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/ShiftBookRequest' } } } },
          responses: { '201': { description: 'Shift booked' } },
        },
      },
      '/api/shift-bookings/my':           { get: { tags: ['Shift Bookings'], summary: 'My shift bookings', responses: { '200': { description: 'Shifts fetched' } } } },
      '/api/shift-bookings/{id}':         { get: { tags: ['Shift Bookings'], summary: 'Get shift detail', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Shift fetched' } } } },
      '/api/shift-bookings/{id}/track':   { get: { tags: ['Shift Bookings'], summary: 'Track shift (REST fallback)', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Tracking info' } } } },
      '/api/shift-bookings/{id}/cancel':  { put: { tags: ['Shift Bookings'], summary: 'Cancel shift', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Shift cancelled' } } } },
      // PAYMENTS
      '/api/payments/initiate': {
        post: { tags: ['Payments'], summary: 'Initiate Khalti or eSewa payment',
          requestBody: { required: true, content: { 'application/json': { schema: { '$ref': '#/components/schemas/PaymentInitiateRequest' } } } },
          responses: { '200': { description: 'Payment initiated' } },
        },
      },
      '/api/payments/verify': { post: { tags: ['Payments'], summary: 'Verify payment', responses: { '200': { description: 'Payment verified' } } } },
      '/api/payments/my':     { get:  { tags: ['Payments'], summary: 'My payments', responses: { '200': { description: 'Payments fetched' } } } },
      // REVIEWS
      '/api/reviews/room/{roomId}': {
        get:  { tags: ['Reviews'], summary: 'Get room reviews', security: [], parameters: [{ in: 'path', name: 'roomId', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Reviews fetched' } } },
        post: { tags: ['Reviews'], summary: 'Review a room', parameters: [{ in: 'path', name: 'roomId', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Review submitted' } } },
      },
      '/api/reviews/driver/{driverId}': {
        post: { tags: ['Reviews'], summary: 'Review a driver', parameters: [{ in: 'path', name: 'driverId', required: true, schema: { type: 'string' } }], responses: { '201': { description: 'Review submitted' } } },
      },
      // ADMIN
      '/api/admin/dashboard':              { get:    { tags: ['Admin'], summary: 'Admin dashboard stats', responses: { '200': { description: 'Dashboard fetched' } } } },
      '/api/admin/users':                  { get:    { tags: ['Admin'], summary: 'All users', responses: { '200': { description: 'Users fetched' } } } },
      '/api/admin/users/{id}/role':        { put:    { tags: ['Admin'], summary: 'Update user role', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Role updated' } } } },
      '/api/admin/users/{id}':             { delete: { tags: ['Admin'], summary: 'Delete user', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'User deleted' } } } },
      '/api/admin/rooms':                  { get:    { tags: ['Admin'], summary: 'All rooms', responses: { '200': { description: 'Rooms fetched' } } } },
      '/api/admin/rooms/{id}/verify':      { put:    { tags: ['Admin'], summary: 'Verify a room', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Room verified' } } } },
      '/api/admin/rooms/{id}/toggle':      { put:    { tags: ['Admin'], summary: 'Toggle room active/inactive', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Room toggled' } } } },
      '/api/admin/bookings':               { get:    { tags: ['Admin'], summary: 'All room bookings', responses: { '200': { description: 'Bookings fetched' } } } },
      '/api/admin/bookings/{id}/status':   { put:    { tags: ['Admin'], summary: 'Update booking status', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Status updated' } } } },
      '/api/admin/shifts':                 { get:    { tags: ['Admin'], summary: 'All shift bookings', responses: { '200': { description: 'Shifts fetched' } } } },
      '/api/admin/shifts/{id}/assign':     { put:    { tags: ['Admin'], summary: 'Assign driver to shift', parameters: [{ in: 'path', name: 'id', required: true, schema: { type: 'string' } }], responses: { '200': { description: 'Driver assigned' } } } },
      '/api/admin/drivers':                { get:    { tags: ['Admin'], summary: 'All drivers', responses: { '200': { description: 'Drivers fetched' } } } },
      '/api/admin/drivers (POST)':         { post:   { tags: ['Admin'], summary: 'Create a driver', responses: { '201': { description: 'Driver created' } } } },
    },
  },
  apis: [],
};

export const swaggerSpec = swaggerJsdoc(options);
