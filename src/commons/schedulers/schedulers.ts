import cron from 'node-cron';
import dayjs from 'dayjs';
import axios from 'axios';

class Schedulers {
  private hostUrl = '';
  private serviceUptimeCheck = cron.schedule('*/3 * * * *', async () => {
    console.log(
      `checking service health ${this.hostUrl}.....`,
      dayjs().format(),
    );
    await axios.get(`${this.hostUrl}/health`);
  });

  public start = (url: string) => {
    try {
      this.hostUrl = url;
      this.serviceUptimeCheck.start();
    } catch (error) {
      console.error(`error starting scheduler: ${error}`);
    }
  };

  public stop = () => {
    try {
      this.serviceUptimeCheck.stop();
    } catch (error) {
      console.error(`error stopping scheduler: ${error}`);
    }
  };
}

export default Schedulers;
