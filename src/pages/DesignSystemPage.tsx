import { Link } from 'react-router-dom';
import { usePageMeta } from '../hooks/usePageMeta';
import { LogoIcon } from '../components/icons';
import { ColorsSection } from './design-system/ColorsSection';
import { TypographySection } from './design-system/TypographySection';
import { RadiiShadowsSection } from './design-system/RadiiShadowsSection';
import { IconsSection } from './design-system/IconsSection';
import { ButtonsSection } from './design-system/ButtonsSection';
import { FormFieldsSection } from './design-system/FormFieldsSection';
import { AtomsSection } from './design-system/AtomsSection';
import { MoleculesSection } from './design-system/MoleculesSection';
import { OrganismsSection } from './design-system/OrganismsSection';
import styles from './DesignSystemPage.module.css';

const NAV_ITEMS = [
  { href: '#colors', label: 'Colors' },
  { href: '#typography', label: 'Typography' },
  { href: '#radii-shadows', label: 'Radii & Shadows' },
  { href: '#icons', label: 'Icons' },
  { href: '#buttons', label: 'Buttons' },
  { href: '#form-fields', label: 'Form Fields' },
  { href: '#atoms', label: 'Atoms' },
  { href: '#molecules', label: 'Molecules' },
  { href: '#organisms', label: 'Organisms' },
];

export function DesignSystemPage() {
  usePageMeta({ title: 'Design System', noindex: true });
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.logoMark}>
            <LogoIcon />
          </span>
          <span className={styles.brandName}>FlowBoard</span>
          <h1 className={styles.badge}>Design System</h1>
        </div>
        <Link to="/boards" className={styles.backLink}>
          Back to app
        </Link>
      </header>

      <div className={styles.body}>
        <nav className={styles.sidebar} aria-label="Design system sections">
          {NAV_ITEMS.map((item) => (
            <a key={item.href} href={item.href} className={styles.navLink}>
              {item.label}
            </a>
          ))}
        </nav>

        <main className={styles.content}>
          <p className={styles.intro}>
            Every color, type size, icon, and component below is real — the same code the rest of FlowBoard uses.
            The source of truth is <code>design-system.md</code> at the root of the repo.
          </p>
          <ColorsSection />
          <TypographySection />
          <RadiiShadowsSection />
          <IconsSection />
          <ButtonsSection />
          <FormFieldsSection />
          <AtomsSection />
          <MoleculesSection />
          <OrganismsSection />
        </main>
      </div>
    </div>
  );
}
