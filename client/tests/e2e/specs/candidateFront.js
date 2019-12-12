/* Tests :
CONNECTED CANDIDATE FRONT
- Display of the FAQ
- Display of the 'Mentions Légales'
- Display of the profile
- Ability to add a reservation
- Ability to change the reservation
- Ability to resend confirmation mail
- Ability to cancel a reservation
- Confirmation email
- Cancellation email

PUBLIC CANDIDATE FRONT
- Display of the FAQ when not connected
- Display of the 'Mentions Légales' when not connected
- Ability to go back to the introduction page
*/

// Initialise magicLink

describe('Connected candidate front', () => {
  let magicLink

  before(() => {
    // Delete all mails before start
    cy.deleteAllMails()
    cy.adminLogin()
    cy.archiveCandidate()
    cy.addPlanning()
    cy.addToWhitelist()
    cy.adminDisconnection()
    cy.candidatePreSignUp()
    // The admin validates the candidate via Aurige
    cy.adminLogin()
    cy.candidateValidation()
    // Disconnects from the app
    cy.adminDisconnection()
    // The candidate gets the link
    cy.getLastMail().getRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.getLastMail().getSubject()
      .should('contain', '=?UTF-8?Q?Validation_de_votre_inscription_=C3=A0_C?= =?UTF-8?Q?andilib?=')
    cy.getLastMail().its('Content.Body').then((mailBody) => {
      const codedLink = mailBody.split('href=3D"')[1].split('">')[0]
      const withoutEq = codedLink.replace(/=\r\n/g, '')
      magicLink = withoutEq.replace(/=3D/g, '=')
    })
  })

  it('Should display FAQ', () => {
    cy.visit(magicLink).wait(1000)
    cy.contains('help_outline').click()
    cy.url().should('contain', 'faq')
    cy.get('h2').should('contain', 'F.A.Q')

    cy.get('.question-content').should('not.be.visible')
    cy.get('.question')
      .contains('?')
      .click()
    cy.get('.question-content').should('be.visible')
  })

  it('Should display Mentions légales', () => {
    cy.visit(magicLink).wait(1000)
    cy.contains('account_balance').click()
    cy.url().should('contain', 'mentions-legales')
    cy.get('h2').should('contain', 'Mentions légales')
  })

  it('Should display the profile page', () => {
    cy.visit(magicLink)
    cy.wait(1000)
    cy.get('.t-my-profile')
      .click()
    cy.url()
      .should('contain', 'mon-profil')
    cy.get('h2')
      .should('contain', 'Mon profil')
    cy.contains('Nom de naissance')
      .parent().parent()
      .should('contain', Cypress.env('candidat'))
  })

  it('Should book a place', () => {
    cy.visit(magicLink)
    cy.wait(1000)
    cy.get('h2').should('contain', 'Choix du centre')
    cy.contains(Cypress.env('centre')).click()
    cy.get('.v-tab .primary--text').click()
    cy.contains(' ' + Cypress.env('placeDate').split('-')[2] + ' ')
      .parents('.v-list')
      .within($date => {
        cy.root().click()
        cy.get('container')
          .should('not.contain', '07h30-08h00')
          .and('not.contain', '16h00-16h30')
          .and('not.contain', '12h30-13h00')
        cy.contains('08h30-09h00').click()
      })
    cy.get('h2').should('contain', 'Confirmation')
    cy.get('h3').should('contain', Cypress.env('centre'))
    cy.get('[type=checkbox]')
      .first()
      .check({ force: true })
    cy.get('[type=checkbox]')
      .last()
      .check({ force: true })
    cy.get('button')
      .contains('Confirmer')
      .click()
    cy.get('.v-snack').should(
      'contain',
      'Votre réservation a bien été prise en compte',
    )
    cy.get('h2').should('contain', 'Ma réservation')
    cy.get('h3').should('contain', Cypress.env('centre'))
    cy.get('p').should('contain', 'à 08:30')
    cy.getLastMail()
      .getRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.getLastMail()
      .getSubject()
      .should(
        'contain',
        '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=',
      )
    cy.getLastMail()
      .its('Content.Body')
      .should('contain', Cypress.env('centre').toUpperCase())
      .and('contain', '8:30')
    cy.get('.t-evaluation', { timeout: 10000 }).should(
      'contain',
      'Merci de noter Candilib',
    )
    cy.wait(1000)
    cy.get('.t-evaluation-submit').click()
  })

  it('Should change the booked place', () => {
    cy.visit(magicLink)
    cy.get('.t-candidat-home').click()
    cy.contains('Modifier ma réservation').click()
    cy.contains(Cypress.env('centre')).click()
    cy.get('.v-tab .primary--text').click()
    cy.contains(' ' + Cypress.env('placeDate').split('-')[2] + ' ')
      .parents('.v-list')
      .within($date => {
        cy.root().click()
        cy.contains('10h00-10h30').click()
      })
    cy.get('h2').should('contain', 'Confirmer la modification')
    cy.get('h3').should('contain', Cypress.env('centre'))
    cy.get('[type=checkbox]')
      .first()
      .check({ force: true })
    cy.get('[type=checkbox]')
      .last()
      .check({ force: true })
    cy.get('button')
      .contains('Confirmer')
      .click()
    cy.get('.v-snack').should(
      'contain',
      'Votre réservation a bien été prise en compte',
    )
    cy.get('h2').should('contain', 'Ma réservation')
    cy.get('h3').should('contain', Cypress.env('centre'))
    cy.get('p').should('contain', 'à 10:00')
    cy.getLastMail()
      .getRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.getLastMail()
      .getSubject()
      .should(
        'contain',
        '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=',
      )
    cy.getLastMail()
      .its('Content.Body')
      .should('contain', Cypress.env('centre').toUpperCase())
      .and('contain', '10:00')
    cy.getLastMail({
      subject:
        '=?UTF-8?Q?Annulation_de_votre_convocation_=C3=A0_l?= =?UTF-8?Q?=27examen?=',
    }).should('have.property', 'Content')
  })

  it('Should resend convocation', () => {
    cy.visit(magicLink)
    cy.contains('Renvoyer ma convocation').click()
    cy.get('.v-snack').should(
      'contain',
      'Votre convocation a été envoyée dans votre boîte mail.',
    )
    cy.getLastMail()
      .getRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.getLastMail()
      .getSubject()
      .should(
        'contain',
        '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=',
      )
    cy.getLastMail()
      .its('Content.Body')
      .should('contain', Cypress.env('centre').toUpperCase())
      .and('contain', '10:00')
  })

  it('Should resend confirmation mail', () => {
    cy.visit(magicLink)
    cy.contains('Renvoyer ma convocation').click()
    cy.get('.v-snack').should(
      'contain',
      'Votre convocation a été envoyée dans votre boîte mail.',
    )
    cy.getLastMail()
      .getRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.getLastMail()
      .getSubject()
      .should(
        'contain',
        '=?UTF-8?Q?Convocation_=C3=A0_l=27examen_pratique_d?= =?UTF-8?Q?u_permis_de_conduire?=',
      )
    cy.getLastMail()
      .its('Content.Body')
      .should('contain', Cypress.env('centre').toUpperCase())
      .and('contain', '10:00')
  })

  it('Should cancel booked place', () => {
    cy.visit(magicLink)
    cy.contains('Annuler ma réservation').click()
    cy.get('button')
      .contains('Confirmer')
      .click()
    cy.get('.v-snack').should(
      'contain',
      'Votre annulation a bien été prise en compte.',
    )
    cy.get('h2').should('contain', 'Choix du centre')
    cy.getLastMail()
      .getRecipients()
      .should('contain', Cypress.env('emailCandidat'))
    cy.getLastMail()
      .getSubject()
      .should(
        'contain',
        '=?UTF-8?Q?Annulation_de_votre_convocation_=C3=A0_l?= =?UTF-8?Q?=27examen?=',
      )
    cy.getLastMail()
      .its('Content.Body')
      .should('contain', Cypress.env('centre').toUpperCase())
      .and('contain', '10:00')
  })

  it('Should disconnect', () => {
    cy.visit(magicLink)
    cy.get('.t-disconnect')
      .click()
    cy.url().should('contain', 'presignup')
  })
})

describe('Public candidate front', () => {
  it('Should display FAQ', () => {
    cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
    cy.get('.t-faq').click()
    cy.url().should('contain', 'faq')
    cy.get('h2').should('contain', 'F.A.Q')
    cy.get('.question-content').should('not.be.visible')
    cy.get('.question')
      .contains('?')
      .click()
    cy.get('.question-content').should('be.visible')
    cy.get('.home-link').click()
    cy.url().should('contain', 'qu-est-ce-que-candilib')
  })

  it('Should display Mentions Légales', () => {
    cy.visit(Cypress.env('frontCandidat') + 'qu-est-ce-que-candilib')
    cy.get('.t-mentions-legales')
      .click()
    cy.url()
      .should('contain', 'mentions-legales')
    cy.get('h2')
      .should('contain', 'Mentions légales')
    cy.visit(Cypress.env('frontCandidat') + 'candidat-presignup')
  })
})
