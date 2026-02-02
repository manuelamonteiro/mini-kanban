/// <reference types="cypress" />

declare global {
  namespace Cypress {
    interface Chainable {
      /**
       * Custom command to login with email and password
       * @example cy.login('ana@example.com', 'segredo123')
       */
      login(email: string, password: string): Chainable<void>

      /**
       * Custom command to drag and drop an element
       * @example cy.get('[data-testid="card-1"]').dragTo('[data-testid="column-2"]')
       */
      dragTo(target: string): Chainable<void>
    }
  }
}

Cypress.Commands.add("login", (email: string, password: string) => {
  cy.visit("/login")
  cy.get('[data-testid="login-email"]').type(email)
  cy.get('[data-testid="login-password"]').type(password)
  cy.get('[data-testid="login-submit"]').click()
  cy.url().should("include", "/home")
  cy.get('[data-testid="home-page"]').should("be.visible")
})

Cypress.Commands.add("dragTo", { prevSubject: "element" }, (subject, target) => {
  const dataTransfer = new DataTransfer()

  cy.wrap(subject)
    .trigger("dragstart", {
      dataTransfer,
    })

  cy.get(target)
    .trigger("dragover", {
      dataTransfer,
    })
    .trigger("drop", {
      dataTransfer,
    })

  cy.wrap(subject).trigger("dragend")
})

export {}
