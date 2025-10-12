describe('Registration Flow', () => {
  beforeEach(() => {
    // Intercept API request and log details
    cy.intercept('POST', '/api/auth/register', (req) => {
      console.log('API request payload:', req.body);
      req.on('response', (res) => {
        console.log('API response:', res);
      });
    }).as('register');
    // Test server-test availability
    cy.request({
      method: 'GET',
      url: 'http://localhost:5001/',
      retryOnNetworkFailure: true,
      timeout: 20000,
    }).then((response) => {
      console.log('Server-test health check:', response);
    });
    cy.visit('/auth/signup', { timeout: 20000 });
    // Log DOM for debugging
    cy.document().then((doc) => {
      console.log('DOM content:', doc.body.innerHTML);
    });
  });

  it('should register an individual user and show success message', () => {
    cy.get('input[placeholder="testuser"]').type('testuser' + Date.now());
    cy.get('input[type="email"]').type('test' + Date.now() + '@example.com');
    cy.get('select').select('individual');
    cy.get('input[type="password"]').eq(0).type('password123');
    cy.get('input[type="password"]').eq(1).type('password123');
    cy.get('button').contains('Create account').click();
    cy.wait('@register', { timeout: 20000 }).its('response').should((response) => {
      console.log('API response details:', response);
      expect(response.statusCode).to.eq(201);
      expect(response.body.message).to.contain('Registration successful');
    });
    cy.get('div.text-green-600.text-sm', { timeout: 15000 })
      .contains('Registration complete, confirm email')
      .should('be.visible');
  });

  it('should register an organization user with organization name', () => {
    cy.get('input[placeholder="testuser"]').type('orguser' + Date.now());
    cy.get('input[type="email"]').type('org' + Date.now() + '@example.com');
    cy.get('select').select('organization');
    cy.get('input[placeholder="Enter organization name"]').type('Test Org');
    cy.get('input[type="password"]').eq(0).type('password123');
    cy.get('input[type="password"]').eq(1).type('password123');
    cy.get('button').contains('Create account').click();
    cy.wait('@register', { timeout: 20000 }).its('response').should((response) => {
      console.log('API response details:', response);
      expect(response.statusCode).to.eq(201);
      expect(response.body.message).to.contain('Registration successful');
    });
    cy.get('div.text-green-600.text-sm', { timeout: 15000 })
      .contains('Registration complete, confirm email')
      .should('be.visible');
  });

  it('should show error for mismatched passwords', () => {
    cy.get('input[placeholder="testuser"]').type('testuser');
    cy.get('input[type="email"]').type('test@example.com');
    cy.get('select').select('individual');
    cy.get('input[type="password"]').eq(0).type('password123');
    cy.get('input[type="password"]').eq(1).type('wrongpassword');
    cy.get('button').contains('Create account').click();
    cy.on('window:alert', (str) => {
      expect(str).to.equal('Passwords do not match');
    });
    cy.get('div.text-green-600.text-sm').should('not.exist');
  });
});
