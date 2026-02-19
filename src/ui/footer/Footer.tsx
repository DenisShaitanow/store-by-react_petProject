import type { FC } from "react";
import { Link } from "../link";
import styles from "./Footer.module.css";
import { Logo } from "../logo";

export const Footer: FC = () => (
  <footer className={styles.footer}>
    <div className={styles.container}>
      <Logo />
      <nav className={styles.nav}>
        <div className={styles.navColumn}>
          <Link to="/contacts" variant="secondary">
            Контакты
          </Link>
          <Link to="/blog" variant="secondary">
            Блог
          </Link>
        </div>
        <div className={styles.navColumn}>
          <Link to="/privacy" variant="secondary">
            Политика конфиденциальности
          </Link>
          <Link to="/terms" variant="secondary">
            Пользовательское соглашение
          </Link>
        </div>
      </nav>
      <div className={styles.bottom}>StoreThings © 2025</div>
    </div>
  </footer>
);
