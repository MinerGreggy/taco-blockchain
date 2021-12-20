import { shell } from 'electron';
import React from 'react';
import styled from 'styled-components';
import { Route, Switch, useRouteMatch } from 'react-router';
import { AppBar, Toolbar, Drawer, Divider } from '@material-ui/core';
import { Alert } from '@material-ui/lab';
import {
  DarkModeToggle,
  LocaleToggle,
  Flex,
  Logo,
  ToolbarSpacing,
} from '@taco/core';
import { defaultLocale, locales } from '../../config/locales';
import Wallets from '../wallet/Wallets';
import FullNode from '../fullNode/FullNode';
import Plot from '../plot/Plot';
import Farm from '../farm/Farm';
import Pool from '../pool/Pool';
import Block from '../block/Block';
import Settings from '../settings/Settings';
import DashboardSideBar from './DashboardSideBar';
import { DashboardTitleTarget } from './DashboardTitle';
import TradeManager from '../trading/TradeManager';
import BackupCreate from '../backup/BackupCreate';
import { render } from 'react-dom';

const StyledRoot = styled(Flex)`
  height: 100%;
  // overflow: hidden;
`;

const StyledAppBar = styled(AppBar)`
  background-color: ${({ theme }) =>
    theme.palette.type === 'dark' ? '#424242' : 'white'};
  box-shadow: 0px 0px 8px rgba(0, 0, 0, 0.2);
  width: ${({ theme }) => `calc(100% - ${theme.drawer.width})`};
  margin-left: ${({ theme }) => theme.drawer.width};
  z-index: ${({ theme }) => theme.zIndex.drawer + 1};
`;

const StyledDrawer = styled(Drawer)`
  z-index: ${({ theme }) => theme.zIndex.drawer + 2};
  width: ${({ theme }) => theme.drawer.width};
  flex-shrink: 0;

  > div {
    width: ${({ theme }) => theme.drawer.width};
  }
`;

const StyledBody = styled(Flex)`
  min-width: 0;
`;

const StyledBrandWrapper = styled(Flex)`
  height: 64px;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  // border-right: 1px solid rgba(0, 0, 0, 0.12);
`;

const { path } = useRouteMatch();
const https = require('https');
const electron = require("electron");
const app = electron.app || electron.remote.app;
const version = app.getVersion();

export default class Dashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      severity: "info",
      last_version: "Check..",
      link: "No-link"
    };
  }

  updateClick = (event) => {
    if ( this.state.severity === 'warning') {
      shell.openExternal("https://github.com/SkynetNetwork/skynet-blockchain/releases");
    }
  }

  checkUpdate() {
    console.log('AppVersion:',version);

    https.get(
      'https://skynet-network.org/last_update.json', (resp) =>{
        let data = '';
        resp.on('data', (chunk) =>{
          data += chunk;
        });
        resp.on('end', () =>{
          var respParsed = JSON.parse(data);
          if (respParsed.version == version) {
            this.setState({severity: 'info'});
            this.setState({last_version: 'No updates available'});
          } else {
            this.setState({severity: 'warning'});
            this.setState({last_version: 'Update available!'});
          }
        });
      }).on("error", (err) => {
        console.log("Error: " + err.message);
      });
  }
  
 render() {
  return (
    <StyledRoot>
      <BackupCreate />
      <StyledAppBar position="fixed" color="transparent" elevation={0}>
        <Toolbar>
          <DashboardTitleTarget />
          <Flex flexGrow={1} />
          <LocaleToggle locales={locales} defaultLocale={defaultLocale} />
          <Alert style={{cursor:'pointer'}} severity={this.state.severity} onClick={this.updateClick}>{this.state.last_version}</Alert>
          <DarkModeToggle />
        </Toolbar>
      </StyledAppBar>
      <StyledDrawer variant="permanent">
        <StyledBrandWrapper>
          <Logo width={2 / 3} />
        </StyledBrandWrapper>
        <Divider />
        <DashboardSideBar />
      </StyledDrawer>
      <StyledBody flexDirection="column" flexGrow={1}>
        <ToolbarSpacing />
        <Switch>
          <Route path={`${path}`} exact>
            <FullNode />
          </Route>
          <Route path={`${path}/block/:headerHash`} exact>
            <Block />
          </Route>
          <Route path={`${path}/wallets/:walletId?`}>
            <Wallets />
          </Route>
          <Route path={`${path}/plot`}>
            <Plot />
          </Route>
          <Route path={`${path}/farm`}>
            <Farm />
          </Route>
          <Route path={`${path}/pool`}>
            <Pool />
          </Route>
          <Route path={`${path}/trade`}>
            <TradeManager />
          </Route>
          <Route path={`${path}/settings`}>
            <Settings />
          </Route>
        </Switch>
      </StyledBody>
    </StyledRoot>
  );}
}
