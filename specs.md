# Technical Specifications

This document describes the architecture and behaviour of the FindJes.us front-end application using UML diagrams rendered with MermaidJS.

---

## 1. Application Architecture

```mermaid
graph TD
    A[Browser] -->|HTTP GET /web.json| B[GitHub Pages CDN]
    B -->|JSON response| A
    A --> C[Vue 3 SPA]
    C --> D[App.vue]
    D --> E[SearchBar]
    D --> F[FilterBar]
    D --> G[PassageList]
    D --> H[AboutPage]
    D --> I[SearchTipsModal]
    G --> J[PassageCard ×N]
    D -->|usePassages composable| K[Reactive State]
    K -->|wildcardToRegex| L[Search Utility]
```

---

## 2. Data Model

```mermaid
classDiagram
    class BookData {
        +String bookName
        +Chapter[] chapters
    }
    class Chapter {
        +int chapter
        +Passage[] passages
    }
    class Passage {
        +int verse
        +String text
    }
    class FlatPassage {
        +String book
        +int chapter
        +int verse
        +String text
    }
    BookData "1" --> "1..*" Chapter
    Chapter "1" --> "1..*" Passage
    BookData ..> FlatPassage : flattened by usePassages
```

---

## 3. Search & Filter Flow

```mermaid
flowchart LR
    U([User Input]) --> SQ[searchQuery ref]
    U --> FB[filterBook ref]
    U --> FC[filterChapter ref]
    U --> FV[filterVerse ref]

    SQ --> FP[filteredPassages computed]
    FB --> FP
    FC --> FP
    FV --> FP

    FP -->|array of FlatPassage| PL[PassageList]
    PL -->|empty| NR[No results message]
    PL -->|non-empty| PC[PassageCard grid]
```

---

## 4. Wildcard Search Algorithm

```mermaid
flowchart TD
    Start([Input: pattern, text]) --> HasWC{Pattern contains\n* ? # [ ]}
    HasWC -->|No| Sub[Case-insensitive\nsubstring match]
    HasWC -->|Yes| Conv[wildcardToRegex:\nreplace * → .*\nreplace ? → .\nreplace # → \\d\nreplace [!…] → [^…]\nescape other chars]
    Conv --> RE[RegExp]
    RE --> Test[regex.test text]
    Sub --> Result([true / false])
    Test --> Result
```

---

## 5. CI/CD Pipeline

```mermaid
flowchart TD
    PR[Pull Request to main] --> W1[pr-check workflow]
    W1 --> L[npm run lint]
    W1 --> B1[npm run build]
    L --> Pass{All checks pass?}
    B1 --> Pass
    Pass -->|Yes| MR[Merge allowed]
    Pass -->|No| Fail[PR blocked]

    Merge[Push / merge to main] --> W2[deploy workflow]
    W2 --> B2[npm run build]
    B2 --> UP[Upload dist/ artifact]
    UP --> DP[actions/deploy-pages]
    DP --> GP[GitHub Pages live]
    DP --> Tag[Create tag YYYY-MM-dd_v#]
```

---

## 6. Component Lifecycle

```mermaid
sequenceDiagram
    participant Browser
    participant App.vue
    participant usePassages
    participant GitHubPages

    Browser->>App.vue: Load SPA
    App.vue->>usePassages: initialise reactive state
    App.vue->>GitHubPages: fetch('/web.json')
    GitHubPages-->>App.vue: JSON data
    App.vue->>App.vue: rawData.value = json (loading = false)
    App.vue->>usePassages: computed re-evaluates
    usePassages-->>App.vue: allPassages, filteredPassages
    App.vue->>Browser: Render PassageList
```
