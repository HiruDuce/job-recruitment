import React, { useState } from 'react';
import { Button, Col, Row, Select, Space } from 'antd';
import {
  SearchOutlined,
  EnvironmentOutlined,
  ThunderboltOutlined,
  CodeOutlined,
} from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { LOCATIONS, SKILLS } from '../../config/constants';
import styles from './ClientComponents.module.scss';

interface IProps {
  initialSkills?: string[];
  initialLocation?: string;
  showQuickTags?: boolean;
}

const POPULAR_SKILLS = ['REACTJS', 'NODEJS', 'JAVA', 'PYTHON', 'TYPESCRIPT', 'GOLANG'];

export const SearchBar: React.FC<IProps> = ({
  initialSkills = [],
  initialLocation,
  showQuickTags = true,
}) => {
  const navigate = useNavigate();
  const [selectedSkills, setSelectedSkills] = useState<string[]>(initialSkills);
  const [selectedLocation, setSelectedLocation] = useState<string | undefined>(
    initialLocation,
  );

  const handleSearch = () => {
    const params = new URLSearchParams();
    if (selectedSkills && selectedSkills.length > 0) {
      params.set('skills', selectedSkills.join(','));
    }
    if (selectedLocation) {
      params.set('location', selectedLocation);
    }
    navigate(`/job?${params.toString()}`);
  };

  const handleQuickTagClick = (skill: string) => {
    let nextSkills: string[];
    if (selectedSkills.includes(skill)) {
      nextSkills = selectedSkills.filter((s) => s !== skill);
    } else {
      nextSkills = [...selectedSkills, skill];
    }
    setSelectedSkills(nextSkills);

    const params = new URLSearchParams();
    if (nextSkills.length > 0) {
      params.set('skills', nextSkills.join(','));
    }
    if (selectedLocation) {
      params.set('location', selectedLocation);
    }
    navigate(`/job?${params.toString()}`);
  };

  return (
    <div className={styles.searchBarWrapper}>
      <div className={styles.searchCard}>
        <Row gutter={[12, 12]} align="middle">
          {/* Ô chọn kỹ năng */}
          <Col xs={24} md={12} lg={13}>
            <div className={styles.inputGroup}>
              <div className={styles.inputPrefixIcon}>
                <CodeOutlined />
              </div>
              <Select
                mode="multiple"
                className={styles.modernSelect}
                placeholder="Chọn kỹ năng IT (vd: REACTJS, NODEJS...)"
                value={selectedSkills}
                onChange={setSelectedSkills}
                options={SKILLS.map((s) => ({ label: s, value: s }))}
                allowClear
                size="large"
                maxTagCount="responsive"
              />
            </div>
          </Col>

          {/* Ô chọn địa điểm */}
          <Col xs={24} md={7} lg={7}>
            <div className={styles.inputGroup}>
              <div className={styles.inputPrefixIcon}>
                <EnvironmentOutlined />
              </div>
              <Select
                className={styles.modernSelect}
                placeholder="Tất cả địa điểm"
                value={selectedLocation}
                onChange={setSelectedLocation}
                options={LOCATIONS}
                allowClear
                size="large"
              />
            </div>
          </Col>

          {/* Nút tìm kiếm */}
          <Col xs={24} md={5} lg={4}>
            <Button
              type="primary"
              icon={<SearchOutlined />}
              size="large"
              block
              className={styles.searchButton}
              onClick={handleSearch}
            >
              Tìm kiếm
            </Button>
          </Col>
        </Row>
      </div>

      {/* Gợi ý kỹ năng HOT */}
      {showQuickTags && (
        <div className={styles.quickTagsBar}>
          <Space wrap size={[8, 8]} align="center">
            <span className={styles.quickTagsLabel}>
              <ThunderboltOutlined style={{ color: '#f59e0b' }} /> Xu hướng:
            </span>
            {POPULAR_SKILLS.map((skill) => {
              const isActive = selectedSkills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => handleQuickTagClick(skill)}
                  className={`${styles.quickTagBtn} ${
                    isActive ? styles.quickTagBtnActive : ''
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </Space>
        </div>
      )}
    </div>
  );
};

export default SearchBar;
