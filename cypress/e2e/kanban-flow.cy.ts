/// <reference types="cypress" />

describe("Mini Kanban - Complete Flow", () => {
  const testEmail = "ana@example.com"
  const testPassword = "segredo123"
  let firstBoardId: string
  let secondBoardId: string
  let firstColumnId: string
  let secondColumnId: string
  let cardId: string

  before(() => {
    cy.clearAllLocalStorage()
    cy.clearAllCookies()
  })

  describe("1. Login e Authentication", () => {
    it("should login successfully", () => {
      cy.visit("/login")
      
      cy.get('[data-testid="login-page"]').should("be.visible")
      
      cy.get('[data-testid="login-email"]').type(testEmail)
      cy.get('[data-testid="login-password"]').type(testPassword)
      
      cy.get('[data-testid="login-submit"]').click()
      
      cy.url().should("include", "/home")
      cy.get('[data-testid="home-page"]').should("be.visible")
    })
  })

  describe("2. Create Board", () => {
    it("should create a new board", () => {
      cy.get('[data-testid="new-board-trigger"]').click()
      
      cy.get('[data-testid="new-board-dialog"]').should("be.visible")
      
      const boardName = `Test Board ${Date.now()}`
      cy.get('[data-testid="new-board-name"]').type(boardName)
      
      cy.get('[data-testid="new-board-submit"]').click()
      
      cy.url().should("include", "/boards/")
      cy.get('[data-testid="board-page"]').should("be.visible")
      
      cy.url().then((url) => {
        const match = url.match(/\/boards\/(.+)/)
        if (match) {
          firstBoardId = match[1]
        }
      })
    })
  })

  describe("3. Manage Multiple Boards", () => {
    it("should go back to home", () => {
      cy.get('[data-testid="back-home-button"]').click()
      cy.url().should("include", "/home")
      cy.get('[data-testid="home-page"]').should("be.visible")
    })

    it("should create a second board", () => {
      cy.get('[data-testid="new-board-trigger"]').click()
      
      const secondBoardName = `Second Board ${Date.now()}`
      cy.get('[data-testid="new-board-name"]').type(secondBoardName)
      
      cy.get('[data-testid="new-board-submit"]').click()
      
      cy.url().should("include", "/boards/")
      cy.get('[data-testid="board-page"]').should("be.visible")
      
      cy.url().then((url) => {
        const match = url.match(/\/boards\/(.+)/)
        if (match) {
          secondBoardId = match[1]
        }
      })
    })

    it("should go back to home again", () => {
      cy.get('[data-testid="back-home-button"]').click()
      cy.url().should("include", "/home")
    })

    it("should delete the second board created", () => {
      cy.get('[data-testid="boards-grid"]').should("be.visible")
      
      cy.get(`[data-testid="board-card-${secondBoardId}"]`).should("exist")
      
      cy.get(`[data-testid="board-card-${secondBoardId}"]`).trigger("mouseenter")
      
      cy.get(`[data-testid="board-delete-${secondBoardId}"]`).click({ force: true })
      
      cy.get('[data-testid="board-delete-dialog"]').should("be.visible")
      
      cy.get('[data-testid="board-delete-confirm"]').click()
      
      cy.get(`[data-testid="board-card-${secondBoardId}"]`).should("not.exist")
    })
  })

  describe("4. Navigate to Board", () => {
    it("should enter the available board", () => {
      cy.get(`[data-testid="board-link-${firstBoardId}"]`).click()
      
      cy.url().should("include", `/boards/${firstBoardId}`)
      cy.get('[data-testid="board-page"]').should("be.visible")
      cy.get('[data-testid="board-columns"]').should("be.visible")
    })
  })

  describe("5. Create Card", () => {
    it("should identify the columns and create a card in the first column", () => {
      cy.get('[data-testid="board-columns"]').should("be.visible")
      
      cy.get('[data-testid^="column-"]').first().then(($column) => {
        const columnTestId = $column.attr("data-testid")
        if (columnTestId) {
          firstColumnId = columnTestId.replace("column-", "")
          
          cy.get(`[data-testid="column-add-${firstColumnId}"]`).click()
        }
      })
      
      cy.get('[data-testid="card-dialog"]').should("be.visible")
      
      const cardTitle = `Test Card ${Date.now()}`
      const cardDescription = "This is a test card description"
      
      cy.get('[data-testid="card-title"]').type(cardTitle)
      cy.get('[data-testid="card-description"]').type(cardDescription)
      
      cy.get('[data-testid="card-dialog-save"]').click()
      
      cy.get('[data-testid="card-dialog"]').should("not.exist")
      
      cy.get(`[data-testid="column-body-${firstColumnId}"]`)
        .find('[data-testid^="card-"]')
        .first()
        .should("contain", cardTitle)
        .then(($card) => {
          const cardTestId = $card.attr("data-testid")
          if (cardTestId) {
            cardId = cardTestId.replace("card-", "")
          }
        })
    })
  })

  describe("6. Drag and Drop Card", () => {
    it("should drag the card to the second column", () => {
      cy.get('[data-testid^="column-"]').eq(1).then(($column) => {
        const columnTestId = $column.attr("data-testid")
        if (columnTestId) {
          secondColumnId = columnTestId.replace("column-", "")
        }
      })
      
      cy.wait(500)
      
      const dataTransfer = new DataTransfer()
      
      cy.get(`[data-testid="card-${cardId}"]`)
        .trigger("dragstart", { dataTransfer })
      
      cy.get(`[data-testid="column-body-${secondColumnId}"]`)
        .trigger("dragover", { dataTransfer, force: true })
        .trigger("drop", { dataTransfer, force: true })
      
      cy.get(`[data-testid="card-${cardId}"]`)
        .trigger("dragend")
      
      cy.wait(1000)
      
      cy.get(`[data-testid="column-body-${secondColumnId}"]`)
        .find(`[data-testid="card-${cardId}"]`)
        .should("exist")
    })
  })

  describe("7. Edit Card", () => {
    it("should edit the card title", () => {
      cy.get(`[data-testid="card-${cardId}"]`).trigger("mouseenter")
      
      cy.get(`[data-testid="card-edit-${cardId}"]`).click({ force: true })
      
      cy.get('[data-testid="card-dialog"]').should("be.visible")
      
      const newTitle = `Updated Card ${Date.now()}`
      cy.get('[data-testid="card-title"]').clear().type(newTitle)
      
      cy.get('[data-testid="card-dialog-save"]').click()
      
      cy.get('[data-testid="card-dialog"]').should("not.exist")
      
      cy.get(`[data-testid="card-${cardId}"]`).should("contain", newTitle)
    })
  })

  describe("8. Delete Card", () => {
    it("should delete the card", () => {
      cy.get(`[data-testid="card-${cardId}"]`).trigger("mouseenter")
      
      cy.get(`[data-testid="card-delete-${cardId}"]`).click({ force: true })
      
      cy.get('[data-testid="card-delete-dialog"]').should("be.visible")
      
      cy.get('[data-testid="card-delete-confirm"]').click()
      
      cy.get('[data-testid="card-delete-dialog"]').should("not.exist")
      
      cy.get(`[data-testid="card-${cardId}"]`).should("not.exist")
    })
  })
})
