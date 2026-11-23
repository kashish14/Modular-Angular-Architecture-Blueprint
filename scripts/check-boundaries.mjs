// Fails if an import crosses a forbidden layer boundary:
//   core     -> shared | layout | features
//   shared   -> layout | features
//   features -> layout | another feature
import { readFileSync, readdirSync } from 'node:fs';
import { join, relative, resolve, dirname, sep } from 'node:path';

const APP = resolve('src/app');
const aliases = { '@core/': 'core/', '@shared/': 'shared/', '@layout/': 'layout/', '@features/': 'features/' };
const forbidden = { core: ['shared', 'layout', 'features'], shared: ['layout', 'features'], features: ['layout'] };

const files = readdirSync(APP, { recursive: true })
  .filter(f => f.endsWith('.ts') && !f.endsWith('.spec.ts'))
  .map(f => join(APP, f));

const area = path => {
  const parts = relative(APP, path).split(sep);
  return { layer: parts[0], feature: parts[0] === 'features' ? parts[1] : null };
};

const errors = [];
for (const file of files) {
  const from = area(file);
  for (const [, spec] of readFileSync(file, 'utf8').matchAll(/from\s+['"]([^'"]+)['"]/g)) {
    const alias = Object.keys(aliases).find(a => spec.startsWith(a));
    const target = alias ? join(APP, aliases[alias], spec.slice(alias.length)) : spec.startsWith('.') ? resolve(dirname(file), spec) : null;
    if (!target || !target.startsWith(APP)) continue;
    const to = area(target);
    const crossFeature = from.layer === 'features' && to.layer === 'features' && from.feature !== to.feature;
    if ((forbidden[from.layer] ?? []).includes(to.layer) || crossFeature) {
      errors.push(`${relative(process.cwd(), file)}: imports '${spec}' (${from.feature ?? from.layer} -> ${to.feature ?? to.layer})`);
    }
  }
}

if (errors.length) {
  console.error(`Module boundary violations:\n  ${errors.join('\n  ')}`);
  process.exit(1);
}
console.log(`Module boundaries OK (${files.length} files checked).`);
