/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      login(email: string, password: string): Chainable<void>
    }
  }
}

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login")
  cy.get('[data-testid="login-page"]').should("be.visible")
  cy.get('[data-testid="login-email"]').clear().type(email)
  cy.get('[data-testid="login-password"]').clear().type(password)
  cy.get('[data-testid="login-submit"]').click()

  cy.url().should("include", "/home")
  cy.get('[data-testid="home-page"]').should("be.visible")
})

export { }

