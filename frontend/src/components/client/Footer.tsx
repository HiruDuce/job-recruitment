import React from 'react';
import { Link } from 'react-router';
import {
  CodeOutlined,
  MailOutlined,
  PhoneOutlined,
  EnvironmentOutlined,
  GithubOutlined,
  LinkedinFilled,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import styles from './Footer.module.scss';

export const Footer: React.FC = () => {
  return (
    <footer className={styles.footerWrapper}>
      <div className={styles.footerContainer}>
        <div className={styles.columns}>
          {/* Cột 1: Thông tin thương hiệu */}
          <div className={styles.brandCol}>
            <Link to="/" className={styles.footerLogo}>
              <div className={styles.logoIcon}>
                <CodeOutlined />
              </div>
              <span className={styles.logoText}>ITJobs</span>
              <span className={styles.logoSub}>Vietnam</span>
            </Link>
            <p className={styles.brandDesc}>
              Hệ sinh thái tuyển dụng và kết nối việc làm Công nghệ Thông tin hàng đầu.
              Nơi hội tụ hàng chục ngàn kỹ sư tài năng và các tập đoàn công nghệ tiên phong.
            </p>
            <div className={styles.contactList}>
              <div className={styles.contactItem}>
                <EnvironmentOutlined className={styles.contactIcon} />
                <span>Tòa nhà TechCenter, Cầu Giấy, Hà Nội & Quận 1, TP.HCM</span>
              </div>
              <div className={styles.contactItem}>
                <PhoneOutlined className={styles.contactIcon} />
                <span>Hotline: 1900 6868 (8:00 - 18:00)</span>
              </div>
              <div className={styles.contactItem}>
                <MailOutlined className={styles.contactIcon} />
                <span>Email: contact@itjobs.vn</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Dành cho ứng viên */}
          <div>
            <h4 className={styles.colTitle}>Dành Cho Ứng Viên</h4>
            <ul className={styles.linkList}>
              <li>
                <Link to="/job">Việc làm IT mới nhất</Link>
              </li>
              <li>
                <Link to="/job?skills=REACTJS">Việc làm ReactJS</Link>
              </li>
              <li>
                <Link to="/job?skills=NODEJS">Việc làm NodeJS</Link>
              </li>
              <li>
                <Link to="/company">Danh sách công ty công nghệ</Link>
              </li>
              <li>
                <Link to="/account">Quản lý hồ sơ CV</Link>
              </li>
            </ul>
          </div>

          {/* Cột 3: Dành cho nhà tuyển dụng */}
          <div>
            <h4 className={styles.colTitle}>Dành Cho Nhà Tuyển Dụng</h4>
            <ul className={styles.linkList}>
              <li>
                <Link to="/admin/jobs">Đăng tin tuyển dụng IT</Link>
              </li>
              <li>
                <Link to="/admin/resumes">Tìm kiếm hồ sơ ứng viên</Link>
              </li>
              <li>
                <Link to="/admin">Trang quản trị doanh nghiệp</Link>
              </li>
              <li>
                <a href="#services">Giải pháp tuyển dụng Developer</a>
              </li>
            </ul>
          </div>

          {/* Cột 4: Quy định & Mạng xã hội */}
          <div>
            <h4 className={styles.colTitle}>Quy Định & Kết Nối</h4>
            <ul className={styles.linkList}>
              <li>
                <a href="#privacy">Quy định bảo mật thông tin</a>
              </li>
              <li>
                <a href="#terms">Điều khoản sử dụng dịch vụ</a>
              </li>
              <li>
                <a href="#faq">Câu hỏi thường gặp (FAQ)</a>
              </li>
            </ul>

            <div className={styles.socialGroup}>
              <a href="https://github.com" target="_blank" rel="noreferrer" className={styles.socialBtn}>
                <GithubOutlined />
              </a>
              <a href="https://linkedin.com" target="_blank" rel="noreferrer" className={styles.socialBtn}>
                <LinkedinFilled />
              </a>
              <span className={styles.verifiedBadge}>
                <SafetyCertificateOutlined /> Đã xác thực
              </span>
            </div>
          </div>
        </div>

        {/* Bản quyền */}
        <div className={styles.bottomBar}>
          <div className={styles.copyright}>
            © {new Date().getFullYear()} <strong>ITJobs Vietnam</strong>. Nền tảng kết nối nhân tài Công nghệ Thông tin. All rights reserved.
          </div>
          <div className={styles.badgeText}>
            Hệ thống vận hành an toàn & tiêu chuẩn bảo mật dữ liệu cao cấp.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
