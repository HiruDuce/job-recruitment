import React, { useState } from 'react';
import { Button, Col, Row, Select } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router';
import { LOCATIONS, SKILLS } from '../../config/constants';
import styles from './ClientComponents.module.scss';

interface IProps {
  initialSkills?: string[];
  initialLocation?: string;
}

export const SearchBar: React.FC<IProps> = ({
  initialSkills = [],
  initialLocation,
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

  return (
    <div className={styles.searchBar}>
      <Row gutter={[12, 12]} align="middle">
        <Col xs={24} md={12} lg={14}>
          <Select
            mode="multiple"
            style={{ width: '100%' }}
            placeholder="Chọn kỹ năng IT (vd: REACTJS, NODEJS...)"
            value={selectedSkills}
            onChange={setSelectedSkills}
            options={SKILLS.map((s) => ({ label: s, value: s }))}
            allowClear
            size="large"
          />
        </Col>

        <Col xs={24} md={8} lg={6}>
          <Select
            style={{ width: '100%' }}
            placeholder="Chọn địa điểm"
            value={selectedLocation}
            onChange={setSelectedLocation}
            options={LOCATIONS}
            allowClear
            size="large"
          />
        </Col>

        <Col xs={24} md={4} lg={4}>
          <Button
            type="primary"
            icon={<SearchOutlined />}
            size="large"
            block
            onClick={handleSearch}
          >
            Tìm kiếm
          </Button>
        </Col>
      </Row>
    </div>
  );
};

export default SearchBar;
