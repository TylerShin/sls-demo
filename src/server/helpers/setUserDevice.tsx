import { UAParser } from 'ua-parser-js';
import { AppDispatch } from '@src/store';
import { setDeviceType, UserDevice } from '@src/reducers/layout';

interface SetUserDeviceParams {
  dispatch: AppDispatch;
  userAgent: string;
}

export function setUserDevice({ dispatch, userAgent }: SetUserDeviceParams) {
  const device = new UAParser(userAgent).getDevice();

  if (device && device.type === 'mobile') {
    dispatch(setDeviceType({ userDevice: UserDevice.MOBILE }));
  }
}
