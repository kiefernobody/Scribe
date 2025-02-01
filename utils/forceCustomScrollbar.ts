export const forceCustomScrollbar = (element: HTMLElement) => {
  element.style.setProperty("scrollbar-width", "thin", "important")
  element.style.setProperty("scrollbar-color", "rgb(var(--primary)) rgba(var(--background), 0.3)", "important")
  element.style.setProperty("-ms-overflow-style", "none", "important")

  const styleSheet = document.styleSheets[0]
  const ruleIndex = styleSheet.cssRules.length

  styleSheet.insertRule(
    `
    ${element.tagName.toLowerCase()}::-webkit-scrollbar {
      width: 8px !important;
      height: 8px !important;
    }
  `,
    ruleIndex,
  )

  styleSheet.insertRule(
    `
    ${element.tagName.toLowerCase()}::-webkit-scrollbar-track {
      background: rgba(var(--background), 0.3) !important;
      border-radius: 4px !important;
    }
  `,
    ruleIndex + 1,
  )

  styleSheet.insertRule(
    `
    ${element.tagName.toLowerCase()}::-webkit-scrollbar-thumb {
      background-color: rgb(var(--primary)) !important;
      border-radius: 4px !important;
    }
  `,
    ruleIndex + 2,
  )
}

