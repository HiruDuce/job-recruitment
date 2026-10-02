import React from 'react';
import { Result } from 'antd';
import { useAppSelector } from '../../redux/hooks';

interface IPermissionCheck {
  method: string;
  apiPath: string;
  module?: string;
}

interface IProps {
  permission: IPermissionCheck;
  hideChildren?: boolean;
  children: React.ReactNode;
}

export const Access: React.FC<IProps> = ({
  permission,
  hideChildren = false,
  children,
}) => {
  const { user } = useAppSelector((state) => state.account);

  const hasPermission = user?.permissions?.some(
    (p) =>
      p.method.toUpperCase() === permission.method.toUpperCase() &&
      p.apiPath === permission.apiPath,
  );

  if (hasPermission) {
    return <>{children}</>;
  }

  if (hideChildren) {
    return null;
  }

  return (
    <Result
      status="403"
      title="403 - Không có quyền thao tác"
      subTitle="Bạn không được cấp quyền thực hiện chức năng này."
    />
  );
};
