import type { Descendant } from "slate"

export const validateAndSanitizeContent = (content: string): string => {
  try {
    const parsed = JSON.parse(content);
    if (Array.isArray(parsed) && parsed.length > 0) {
      // Validate each node has required properties
      const isValid = parsed.every(node => 
        typeof node === 'object' && 
        node !== null && 
        'type' in node && 
        'children' in node
      );
      
      if (isValid) return content;
    }
  } catch (error) {
    console.warn("Invalid content format, resetting to default", error);
  }
  
  // Return default content if validation fails
  return JSON.stringify([{
    type: 'paragraph',
    children: [{ text: '' }],
    indent: 0
  }]);
}

