import React from 'react';
import { Link } from 'react-router';
import { CodeOutlined } from '@ant-design/icons';
import styles from './Footer.module.scss';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.footerContainer}>
        <div className={styles.columns}>
          <div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                color: '#fff',
                fontSize: 18,
                fontWeight: 700,
                marginBottom: 12,
              }}
            >
              <CodeOutlined style={{ fontSize: 22, color: '#1677ff' }} />
              <span>ITJobs Vietnam</span>
            </div>
            <p className={styles.colText}>
              Cầu nối sự nghiệp IT hàng đầu — Tiếp cận hàng ngàn cơ hội việc làm
              chất lượng từ các tập đoàn và startup công nghệ uy tín.
            </p>
          </div>

          <div>
            <h4 className={styles.colTitle}>Khám phá</h4>
            <ul className={styles.linkList}>
              <li>
                <Link to="/job">Việc làm IT mới nhất</Link>
              </li>
              <li>
                <Link to="/company">Danh sách công ty</Link>
              </li>
              <li>
                <Link to="/account">Hồ sơ & CV của tôi</Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className={styles.colTitle}>Hỗ trợ</h4>
            <ul className={styles.linkList}>
              <li>
                <a href="#rules">Quy định bảo mật</a>
              </li>
              <li>
                <a href="#terms">Điều khoản sử dụng</a>
              </li>
              <li>
                <a href="#contact">Liên hệ nhà phát triển</a>
              </li>
            </ul>
          </div>
        </div>

        <div className={styles.copyright}>
          © {new Date().getFullYear()} ITJobs. Hệ thống tuyển dụng kỹ sư công nghệ thông tin. All rights reserved.
        </div>
      </div>
    </footer>
  );
};
