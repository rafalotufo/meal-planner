export function sourceHtml(url = 'https://recipes.example.com/chicken', title = 'Crispy chicken') {
  return `<!doctype html><html><head><link rel="canonical" href="${url}"><script type="application/ld+json">${JSON.stringify({ '@type': 'Recipe', url, name: title, recipeIngredient: ['2 chicken breasts', '1 cup breadcrumbs'], recipeInstructions: [{ '@type': 'HowToStep', text: 'Coat chicken in breadcrumbs and bake until cooked through.' }], totalTime: 'PT30M', image: 'https://images.example.com/chicken.jpg' })}</script></head><body><main><h1>${title}</h1><h2>Ingredients</h2><p>2 chicken breasts</p><p>1 cup breadcrumbs</p><h2>Instructions</h2><p>Coat chicken in breadcrumbs and bake until cooked through.</p></main></body></html>`;
}
export function curated(overrides: Record<string, unknown> = {}) {
  return { accepted: true, reason: 'Original recipe matches the query.', title: 'Crispy chicken', summary: 'Coat chicken in breadcrumbs and bake until cooked through.', methodExcerpt: 'Coat chicken in breadcrumbs and bake until cooked through.', ingredientExcerpt: '2 chicken breasts', ...overrides };
}
export function response(value: unknown, status = 'completed') {
  return { status, output: [{ type: 'message', content: [{ type: 'output_text', text: JSON.stringify(value) }] }] };
}
