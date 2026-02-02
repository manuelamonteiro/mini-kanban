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

  beforeEach(() => {
    cy.session([testEmail, testPassword], () => {
      cy.login(testEmail, testPassword)
    })

    cy.visit("/home")
    cy.get('[data-testid="home-page"]').should("be.visible")
  })

  describe("1. Login e Authentication", () => {
    it("should login successfully", () => {
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
        if (match) firstBoardId = match[1]
      })

      cy.then(() => {
        if (!firstBoardId) throw new Error("firstBoardId was not captured from URL")
      })
    })
  })

  describe("3. Manage Multiple Boards", () => {
    it("should go back to home", () => {
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
        if (match) secondBoardId = match[1]
      })

      cy.then(() => {
        if (!secondBoardId) throw new Error("secondBoardId was not captured from URL")
      })
    })

    it("should go back to home again", () => {
      cy.visit("/home")
      cy.url().should("include", "/home")
      cy.get('[data-testid="home-page"]').should("be.visible")
    })

    it("should delete the second board created", () => {
      cy.then(() => {
        if (!secondBoardId) throw new Error("secondBoardId is undefined (previous test did not create board)")
      })

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
      cy.then(() => {
        if (!firstBoardId) throw new Error("firstBoardId is undefined (board was not created)")
      })

      cy.get(`[data-testid="board-link-${firstBoardId}"]`).click()
      cy.url().should("include", `/boards/${firstBoardId}`)

      cy.get('[data-testid="board-page"]').should("be.visible")
      cy.get('[data-testid="board-columns"]').should("be.visible")
    })
  })

  describe("5. Create Card", () => {
    it("should identify the columns and create a card in the first column", () => {
      cy.then(() => {
        if (!firstBoardId) throw new Error("firstBoardId is undefined (board was not created)")
      })

      cy.visit(`/boards/${firstBoardId}`)
      cy.get('[data-testid="board-page"]').should("be.visible")
      cy.get('[data-testid="board-columns"]').should("be.visible")

      cy.get('section[data-testid^="column-"]').first().then(($column) => {
        const columnTestId = $column.attr("data-testid")
        if (!columnTestId) throw new Error("Could not read data-testid from first column section")

        firstColumnId = columnTestId.replace("column-", "")
        cy.get(`[data-testid="column-add-${firstColumnId}"]`).click()
      })

      cy.get('[data-testid="card-dialog"]').should("be.visible")

      const cardTitle = `Test Card ${Date.now()}`
      const cardDescription = "This is a test card description"

      cy.get('[data-testid="card-title"]').type(cardTitle)
      cy.get('[data-testid="card-description"]').type(cardDescription)
      cy.get('[data-testid="card-dialog-save"]').click()

      cy.get('[data-testid="card-dialog"]').should("not.exist")

      cy.then(() => {
        if (!firstColumnId) throw new Error("firstColumnId was not captured")

        cy.get(`[data-testid="column-body-${firstColumnId}"]`)
          .contains('[data-testid^="card-"]', cardTitle)
          .should("be.visible")
          .invoke("attr", "data-testid")
          .then((tid) => {
            if (!tid) throw new Error("Could not capture card data-testid after creation")
            cardId = tid.replace("card-", "")
          })
      })

      cy.then(() => {
        if (!cardId) throw new Error("cardId was not captured after card creation")
      })
    })
  })

  describe("6. Edit Card", () => {
    it("should edit the card title", () => {
      cy.then(() => {
        if (!firstBoardId) throw new Error("firstBoardId is undefined (board was not created)")
        if (!cardId) throw new Error("cardId is undefined (card was not created)")
      })

      cy.visit(`/boards/${firstBoardId}`)
      cy.get('[data-testid="board-page"]').should("be.visible")

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

  describe("7. Delete Card", () => {
    it("should delete the card", () => {
      cy.then(() => {
        if (!firstBoardId) throw new Error("firstBoardId is undefined (board was not created)")
        if (!cardId) throw new Error("cardId is undefined (card was not created)")
      })

      cy.visit(`/boards/${firstBoardId}`)
      cy.get('[data-testid="board-page"]').should("be.visible")

      cy.get(`[data-testid="card-${cardId}"]`).trigger("mouseenter")
      cy.get(`[data-testid="card-delete-${cardId}"]`).click({ force: true })

      cy.get('[data-testid="card-delete-dialog"]').should("be.visible")
      cy.get('[data-testid="card-delete-confirm"]').click()

      cy.get('[data-testid="card-delete-dialog"]').should("not.exist")
      cy.get(`[data-testid="card-${cardId}"]`).should("not.exist")
    })
  })
})
