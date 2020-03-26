import React from 'react';
import ProfileForm from './components/profileForm';
import AuthEditForm from './components/authEditForm';
import { withStyles } from '@src/helpers/withStyles';
import Footer from '@src/components/footer';
import EmailSettings from './components/emailSettings';

const s = require('./userSettings.scss');

const UserSettings: React.FC = () => {
  return (
    <>
      <div className={s.wrapper}>
        <h1 className={s.title}>Settings</h1>
        <ProfileForm />
        <div className={s.authFormWrapper}>
          <AuthEditForm />
        </div>
        <div>
          <EmailSettings />
        </div>
      </div>
      <Footer containerStyle={{ backgroundColor: '#f8f9fb' }} />
    </>
  );
};

export default withStyles<typeof UserSettings>(s)(UserSettings);
