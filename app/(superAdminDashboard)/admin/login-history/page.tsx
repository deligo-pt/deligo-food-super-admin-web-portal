import LoginHistory from '@/components/Dashboard/LoginHistory/LoginHistory';
import { getAllLoginHistory } from '@/services/dashboard/fleet-manager/login-history.service';
import { TLoginHistoryResponse } from '@/types/login-history.type';
import { queryStringFormatter } from '@/utils/formatter';
import React from 'react';

interface IProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

const LoginHistoryPage = async ({ searchParams }: IProps) => {
  const searchParamsObj = await searchParams;
  const queryString = queryStringFormatter(searchParamsObj);
  const loginHistoriesResult = await getAllLoginHistory(queryString);

  return (
    <div>
      <LoginHistory loginHistories={loginHistoriesResult as TLoginHistoryResponse} />
    </div>
  );
};

export default LoginHistoryPage;