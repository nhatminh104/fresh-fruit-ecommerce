import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import PageContainer from '../layout/PageContainer';
import Loading from '../common/Loading';
import ErrorMessage from '../common/ErrorMessage';
import api from '../../services/api';
import { getErrorMessage } from '../../utils/errorMessage';

export default function AdminDetailPage({ title, resource }) {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  useEffect(() => {
    api
      .get(`/admin/${resource}/${id}`)
      .then((response) => setData(response.data.data))
      .catch((requestError) => setError(getErrorMessage(requestError, 'Không thể tải chi tiết.')));
  }, [resource, id]);
  return (
    <PageContainer>
      <Link className="text-sm font-semibold text-forest" to={`/admin/${resource}`}>
        ← Quay lại
      </Link>
      <h1 className="mt-4 font-display text-5xl text-forest">{title}</h1>
      {error ? (
        <div className="mt-6">
          <ErrorMessage message={error} />
        </div>
      ) : !data ? (
        <Loading />
      ) : (
        <pre className="mt-8 overflow-auto rounded-2xl bg-white p-6 text-sm text-slate-700">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </PageContainer>
  );
}
