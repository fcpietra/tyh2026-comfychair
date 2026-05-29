# Diagrama de clases — ComfyChair

Diagrama de clases que refleja la solución completa (código base + funcionalidad
implementada: asignación de revisores, carga de revisiones y selección de artículos).

```mermaid
classDiagram
    direction LR

    class User {
        +String fullName
        +String affiliation
        +String email
        -String encryptedPassword
        +getEncryptedPassword() String
    }

    class Conference {
        -String _name
        -User[] _chairs
        -Session[] _sessions
        +name() String
        +chairs() User[]
        +sessions() Session[]
        +addChair(user)
        +addSession(session)
    }

    class Session {
        -String _name
        -User[] _programCommittee
        -Paper[] _papers
        -Bid[] _bids
        -SessionStatesEnum _stage
        -Number _acceptancePercentage
        -Paper[] _acceptedPapers
        -Map~Paper, User[]~ _assignments
        +name() String
        +programCommittee() User[]
        +reviewers() User[]
        +addReviewer(user)
        +canSubmit(paper) Boolean
        +submit(paper)
        +papers() Paper[]
        +bids() Bid[]
        +stage() SessionStatesEnum
        +closeSubmissions()
        +enterBid(paper, reviewer, interest)
        +bidExistsFor(paper, reviewer) Boolean
        +bidFor(paper, reviewer) Bid
        +interestFor(paper, reviewer) Interest
        +closeBidding()
        +assignments() Map
        +assignmentsFor(paper) User[]
        -_selectReviewersForPaper(paper, quotas, counts) User[]
        +submitReview(paper, reviewer, text, score)
        +closeReviewing()
        +setAcceptancePercentage(percentage)
        +acceptancePercentage() Number
        +selectArticles() Paper[]
        +acceptedPapers() Paper[]
        -_setStage(stage)
    }

    class SessionStatesEnum {
        <<enumeration>>
        RECEIVING
        BIDDING
        REVISION
        SELECTION
        CLOSED
    }

    class Paper {
        +Number allowedReviews$
        -String _title
        -User[] _authors
        -User _correspondingAuthor
        -Review[] _reviews
        +title() String
        +reviews() Review[]
        +reviewsCount() Number
        +isValid() Boolean
        +addReview(reviewer, review, score)
        +score() Number
    }

    class RegularPaper {
        -String _abstract
        +abstract() String
        +setAbstract(abstract)
        +abstractWordCount() Number
        +isValid() Boolean
    }

    class Poster {
        -String _attachmentUrl
        -String _sourcesUrl
        +attachmentUrl() String
        +sourcesUrl() String
    }

    class Review {
        -User _reviewer
        -String _text
        -Number _score
        +reviewer() User
        +text() String
        +score() Number
        +validateScoreRange(score) Number
    }

    class Bid {
        -Paper _paper
        -User _reviewer
        -Interest _interest
        +paper() Paper
        +reviewer() User
        +interest() Interest
        +setInterest(interest)
    }

    class Interests {
        <<enumeration>>
        Interested
        Maybe
        NotInterested
        Conflict
    }

    RegularPaper --|> Paper : extends
    Poster --|> Paper : extends

    Conference "1" o-- "*" User : chairs
    Conference "1" *-- "*" Session : sessions

    Session "1" o-- "*" User : programCommittee
    Session "1" *-- "*" Paper : papers
    Session "1" *-- "*" Bid : bids
    Session ..> SessionStatesEnum : stage
    Session "1" o-- "*" Paper : acceptedPapers
    Session ..> Interests : usa

    Paper "1" *-- "*" Review : reviews
    Paper "1" --> "*" User : authors
    Paper "1" --> "1" User : correspondingAuthor

    Review "*" --> "1" User : reviewer

    Bid "*" --> "1" Paper : paper
    Bid "*" --> "1" User : reviewer
    Bid ..> Interests : interest
```

## Notas

- **Herencia:** `RegularPaper` y `Poster` extienden `Paper`. `RegularPaper`
  sobrescribe `isValid()` para validar el límite de 300 palabras del abstract.
- **Asignación de revisores:** `Session` mantiene `_assignments` (un `Map` de
  `Paper → User[]`) que se completa en `closeBidding()` mediante el método
  privado `_selectReviewersForPaper()`, respetando el orden de prioridad de bids
  y excluyendo conflictos de interés (`Interests.Conflict`).
- **Carga de revisiones:** `submitReview()` valida que la sesión esté en etapa
  `REVISION`, que el revisor esté asignado al artículo, y delega en
  `Paper.addReview()` (que a su vez crea una `Review` y respeta el máximo de
  `Paper.allowedReviews = 3`).
- **Selección:** `selectArticles()` ordena los artículos por score decreciente y
  acepta hasta el `_acceptancePercentage` del total enviado.
- **Composición vs. agregación:** se modela como composición (`*--`) lo que la
  sesión/conferencia/artículo poseen y gestionan internamente (`Session→Paper`,
  `Session→Bid`, `Conference→Session`, `Paper→Review`); como agregación (`o--`)
  las referencias a `User`, que existen de forma independiente y pueden tener
  distintos roles en distintas conferencias.
