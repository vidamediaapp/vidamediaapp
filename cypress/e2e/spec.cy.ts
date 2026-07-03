describe('Pruebas de Estrés y Navegación - Vida Media', () => {
  
  beforeEach(() => {
    cy.visit('http://localhost:8100/login'); 
    cy.wait(2000);
  });

  it('Debería aguantar interacciones de formulario y validar el spinner', () => {
    cy.get('#email').type('usuario@vidamedia.cl', { force: true });
    cy.get('#password').type('PassSegura123', { force: true });

    for (let i = 0; i < 30; i++) {
      cy.get('.eye-btn').click({ force: true });
    }

    cy.get('.vm-submit-btn').click({ force: true });
    cy.get('ion-spinner').should('exist');
  });

  it('Debería validar la ruta de registro y soportar estrés de navegación repetida', () => {
    cy.get('.register-row a')
      .should('have.attr', 'routerLink', '/registro')
      .contains('Crear cuenta');

    for (let i = 0; i < 15; i++) {
      cy.get('.register-row a').click({ force: true });
      cy.url().should('include', '/registro');

      cy.go('back'); 
      cy.url().should('include', '/login');
      cy.wait(300); 
    }
  });
});

describe('Automatización de Registro - Vida Media', () => {

  beforeEach(() => {
    cy.visit('http://localhost:8100/registro');
    cy.wait(3000); 
  });

  it('Debería escribir en todos los campos del formulario automáticamente', () => {
    
    // === SECCIÓN: IDENTIFICACIÓN ===
    cy.get('#rut').type('123456789', { force: true }); // 👈 Forzamos el tipeo aquí
    cy.get('#email').type('test.usuario@vidamedia.cl', { force: true });

    // === SECCIÓN: DATOS PERSONALES ===
    cy.get('#nombre').type('Juan Pablo', { force: true });
    cy.get('#apePat').type('Pérez', { force: true });
    cy.get('#apeMat').type('Cotapos', { force: true }); 
    cy.get('#tel').type('987654321', { force: true });

    // === SECCIÓN: CONTRASEÑA ===
    cy.get('#pass').type('VidaMedia2026!', { force: true });
    cy.get('#passConf').type('VidaMedia2026!', { force: true });

    // === ENVÍO DEL FORMULARIO ===
    cy.get('.vm-submit-btn').should('not.be.disabled').click({ force: true });
    cy.get('ion-spinner').should('exist');
  });
});