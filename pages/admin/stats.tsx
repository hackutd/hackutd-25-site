import Head from 'next/head';
import { useEffect, useState } from 'react';
import CheckIcon from '@mui/icons-material/Check';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import EngineeringIcon from '@mui/icons-material/Engineering';

import { checkUserPermission } from '@/lib/util';
import { RequestHelper } from '@/lib/request-helper';
import { fieldToName } from '@/lib/stats/field';
import { useAuthContext } from '@/lib/user/AuthContext';

import AdminStatsCard from '@/components/admin/AdminStatsCard';
import NivoPieChart from '@/components/admin/NivoPieChart';
import NivoBarChart from '@/components/admin/NivoBarChart';
import Loading from '@/components/icon/Loading';

const allowedRoles = ['super_admin'];

export default function AdminStatsPage() {
  const [loading, setLoading] = useState(true);
  const { user, isSignedIn } = useAuthContext();
  const [statsData, setStatsData] = useState<GeneralStats>();

  useEffect(() => {
    async function getData() {
      const { data } = await RequestHelper.get<GeneralStats & { timestamp: any }>('/api/stats', {
        headers: {
          Authorization: user.token,
        },
      });
      setStatsData(data);
      setLoading(false);
    }
    getData();
  }, []);

  if (!isSignedIn || !checkUserPermission(user, allowedRoles)) {
    return <div className="text-2xl font-black text-center">Unauthorized</div>;
  }

  if (loading) {
    return <Loading width={200} height={200} />;
  }

  return (
    <div className="flex flex-col flex-grow">
      <Head>
        <title>HackUTD 2024 - Admin</title>
        <meta name="description" content="HackPortal's Admin Page" />
      </Head>
      {/* <AdminHeader /> */}
      <div className="w-full xl:w-3/5 mx-auto p-6 flex flex-col gap-y-6">
        <div className="flex-col gap-y-3 w-full md:flex-row flex justify-around gap-x-2">
          <AdminStatsCard icon={<CheckIcon />} title="Check-Ins" value={statsData.checkedInCount} />
          <AdminStatsCard
            icon={<AccountCircleIcon />}
            title="Hackers"
            value={statsData.hackerCount}
          />
          <AdminStatsCard
            icon={<SupervisorAccountIcon />}
            title="Admins"
            value={statsData.adminCount}
          />
          <AdminStatsCard
            icon={<EngineeringIcon />}
            title="Super Admin"
            value={statsData.superAdminCount}
          />
        </div>
        {Object.entries(statsData)
          .filter(([k, v]) => typeof v === 'object')
          .map(([key, value]) => {
            if (Object.keys(value).length <= 6)
              return (
                <NivoPieChart
                  key={key}
                  name={fieldToName[key]}
                  items={Object.entries(statsData[key] as Record<any, any>)
                    .sort((a, b) => {
                      const aMonth = parseInt(a[0].substring(0, a[0].indexOf('-')));
                      const aDate = parseInt(a[0].substring(a[0].indexOf('-') + 1));

                      const bMonth = parseInt(b[0].substring(0, b[0].indexOf('-')));
                      const bDate = parseInt(b[0].substring(b[0].indexOf('-') + 1));

                      if (aMonth != bMonth) return aMonth - bMonth;
                      return aDate - bDate;
                    })
                    .map(([k, v]) => ({
                      id: k,
                      value: v,
                    }))}
                />
              );
            return (
              <NivoBarChart
                key={key}
                name={fieldToName[key]}
                items={Object.entries(statsData[key] as Record<any, any>)
                  .sort((a, b) => {
                    const aMonth = parseInt(a[0].substring(0, a[0].indexOf('-')));
                    const aDate = parseInt(a[0].substring(a[0].indexOf('-') + 1));

                    const bMonth = parseInt(b[0].substring(0, b[0].indexOf('-')));
                    const bDate = parseInt(b[0].substring(b[0].indexOf('-') + 1));

                    if (aMonth != bMonth) return bMonth - aMonth;
                    return bDate - aDate;
                  })
                  .map(([k, v]) => ({
                    itemName: k,
                    itemValue: v,
                  }))}
              />
            );
          })}
      </div>
    </div>
  );
}
