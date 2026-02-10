import { App } from 'antd';
import { useRequest } from 'ahooks';
import { getAbout } from './service';
import styles from './index.module.less';

function About() {
  const { message } = App.useApp();
  const { data: url, loading, error } = useRequest(getAbout, {
    onError: () => {
      message.error('获取关于信息失败');
    },
  });

  if (loading) {
    return <div className={styles.wrap}>加载中...</div>;
  }

  if (error || url == null || !url) {
    return <div className={styles.wrap}>暂无内容</div>;
  }

  return (
    <div className={styles.wrap}>
      <iframe title="关于页面" src={url} className={styles.iframe} />
    </div>
  );
}

export default About;
