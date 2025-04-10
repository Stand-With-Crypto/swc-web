import { USStateCode } from '@/utils/shared/stateMappings/usStateUtils'

export enum SectionNames {
  SURVEY = 'Survey',
  VOTER_REGISTRATION_FORM = 'Voter Registration Form',
  SUCCESS = 'Success',
}

export const ANALYTICS_NAME_USER_ACTION_FORM_VOTER_REGISTRATION =
  'User Action Form Voter Registration'

type RegistrationUrlType = 'registerUrl' | 'checkRegistrationUrl'
type RegistrationByState = Record<RegistrationUrlType, string>

export type RegistrationStatusAnswer = 'yes' | 'no' | 'not-sure'

export const REGISTRATION_URLS_BY_STATE: Record<USStateCode, RegistrationByState> = {
  AL: {
    registerUrl:
      'https://www.alabamainteractive.org/sos/voter_registration/voterRegistrationWelcome.action',
    checkRegistrationUrl: 'https://myinfo.alabamavotes.gov/voterview',
  },
  AK: {
    registerUrl: 'https://voterregistration.alaska.gov/',
    checkRegistrationUrl: 'https://myvoterportal.alaska.gov/',
  },
  AZ: {
    registerUrl: 'https://servicearizona.com/VoterRegistration/selectLanguage',
    checkRegistrationUrl: 'https://my.arizona.vote/WhereToVote.aspx?s=individual',
  },
  AR: {
    registerUrl: 'https://www.sos.arkansas.gov/elections/voter-information',
    checkRegistrationUrl: 'https://www.voterview.ar-nova.org/voterview',
  },
  CA: {
    registerUrl: 'https://registertovote.ca.gov/',
    checkRegistrationUrl: 'https://registertovote.ca.gov/',
  },
  CO: {
    registerUrl: 'https://www.sos.state.co.us/voter/pages/pub/olvr/verifyNewVoter.xhtml',
    checkRegistrationUrl: 'https://www.sos.state.co.us/voter/pages/pub/olvr/findVoterReg.xhtml',
  },
  CT: {
    registerUrl: 'https://voterregistration.ct.gov/OLVR/welcome.do',
    checkRegistrationUrl: 'https://portaldir.ct.gov/sots/LookUp.aspx',
  },
  DE: {
    registerUrl: 'https://ivote.de.gov/VoterView/registrant/newregistrant',
    checkRegistrationUrl: 'https://ivote.de.gov/VoterView',
  },
  DC: {
    registerUrl: 'https://vr.dcboe.org/213324797239968?agency_code=12&?ref=voteusa_en',
    checkRegistrationUrl: 'https://apps.dcboe.org/vrs',
  },
  FL: {
    registerUrl: 'https://registertovoteflorida.gov/home',
    checkRegistrationUrl: 'https://registration.elections.myflorida.com/CheckVoterStatus',
  },
  GA: {
    registerUrl: 'https://mvp.sos.ga.gov/s/voter-registration?IsRegisterNow=true#no-back-button',
    checkRegistrationUrl: 'https://mvp.sos.ga.gov/s/',
  },
  HI: {
    registerUrl: 'https://olvr.hawaii.gov/',
    checkRegistrationUrl: 'https://olvr.hawaii.gov/',
  },
  ID: {
    registerUrl:
      'https://elections.sos.idaho.gov/ElectionLink/ElectionLink/ApplicationInstructions.aspx',
    checkRegistrationUrl:
      'https://elections.sos.idaho.gov/ElectionLink/ElectionLink/VoterSearch.aspx',
  },
  IL: {
    registerUrl:
      'https://ova.elections.il.gov/?Name=Em5DYCKC4wXCKQSXTgsQ9knm%2b5Ip27VC&T=637339537991817098',
    checkRegistrationUrl: 'https://ova.elections.il.gov/RegistrationLookup.aspx',
  },
  IN: {
    registerUrl: 'https://indianavoters.in.gov/',
    checkRegistrationUrl: 'https://indianavoters.in.gov/',
  },
  IA: {
    registerUrl: 'https://mymvd.iowadot.gov/Account/Login?ReturnUrl=%2fVoterRegistration',
    checkRegistrationUrl: 'https://sos.iowa.gov/elections/voterreg/regtovote/search.aspx',
  },
  KS: {
    registerUrl: 'https://www.kdor.ks.gov/apps/voterreg/home/index',
    checkRegistrationUrl: 'https://myvoteinfo.voteks.org/voterview/',
  },
  KY: {
    registerUrl: 'https://vrsws.sos.ky.gov/ovrweb/',
    checkRegistrationUrl: 'https://vrsws.sos.ky.gov/VIC/',
  },
  LA: {
    registerUrl:
      'https://www.sos.la.gov/ElectionsAndVoting/Pages/OnlineVoterRegistration.aspx?Referrer=https://www.sos.la.gov/ElectionsAndVoting/RegisterToVote/Pages/default.aspx',
    checkRegistrationUrl: 'https://voterportal.sos.la.gov/',
  },
  ME: {
    registerUrl: 'https://www.maine.gov/sos/cec/elec/voter-info/votreg.html',
    checkRegistrationUrl: 'https://www.maine.gov/sos/cec/elec/voter-info/votreg.html',
  },
  MD: {
    registerUrl:
      'https://voterservices.elections.maryland.gov/OnlineVoterRegistration/InstructionsStep1',
    checkRegistrationUrl: 'https://voterservices.elections.maryland.gov/VoterSearch',
  },
  MA: {
    registerUrl: 'https://www.sec.state.ma.us/divisions/elections/elections-and-voting.htm',
    checkRegistrationUrl:
      'https://www.sec.state.ma.us/VoterRegistrationSearch/MyVoterRegStatus.aspx',
  },
  MI: {
    registerUrl: 'https://mvic.sos.state.mi.us/Home/RegisterToVote',
    checkRegistrationUrl: 'https://mvic.sos.state.mi.us/Voter/Index',
  },
  MN: {
    registerUrl: 'https://www.sos.state.mn.us/elections-voting/register-to-vote/',
    checkRegistrationUrl: 'https://mnvotes.sos.mn.gov/voterstatuscheck/index',
  },
  MS: {
    registerUrl: 'https://www.sos.ms.gov/elections-voting/voter-registration-information',
    checkRegistrationUrl: 'https://www.msegov.com/sos/voter_registration/amiregistered/Search',
  },
  MO: {
    registerUrl: 'https://s1.sos.mo.gov/elections/voterregistration/',
    checkRegistrationUrl: 'https://voteroutreach.sos.mo.gov/portal/',
  },
  MT: {
    registerUrl: 'https://sosmt.gov/elections/voter-file/',
    checkRegistrationUrl: 'https://prodvoterportal.mt.gov/WhereToVote.aspx',
  },
  NE: {
    registerUrl: 'https://www.nebraska.gov/apps-sos-voter-registration/',
    checkRegistrationUrl: 'https://www.votercheck.necvr.ne.gov/voterview',
  },
  NV: {
    registerUrl: 'https://www.nvsos.gov/sos/elections/voters/registering-to-vote',
    checkRegistrationUrl: 'https://www.nvsos.gov/votersearch/',
  },
  NH: {
    registerUrl: 'https://www.sos.nh.gov/elections/register-vote',
    checkRegistrationUrl: 'https://app.sos.nh.gov/viphome',
  },
  NJ: {
    registerUrl: 'https://www.nj.gov/state/elections/voter-registration.shtml',
    checkRegistrationUrl: 'https://voter.svrs.nj.gov/registration-check',
  },
  NM: {
    registerUrl:
      'https://portal.sos.state.nm.us/OVR/WebPages/InstructionsStep1.aspx?AspxAutoDetectCookieSupport=1',
    checkRegistrationUrl: 'https://voterportal.servis.sos.state.nm.us/WhereToVote.aspx',
  },
  NY: {
    registerUrl: 'https://elections.ny.gov/register-vote#VoteRegForm',
    checkRegistrationUrl: 'https://voterlookup.elections.ny.gov/',
  },
  NC: {
    registerUrl: 'https://www.ncsbe.gov/registering/how-register',
    checkRegistrationUrl: 'https://www.ncsbe.gov/registering/checking-your-registration',
  },
  ND: {
    registerUrl: '',
    checkRegistrationUrl: 'https://vip.sos.nd.gov/WhereToVote.aspx?tab=&ptlPKID=&ptlhPKID=',
  },
  OH: {
    registerUrl: 'https://olvr.ohiosos.gov/',
    checkRegistrationUrl: 'https://voterlookup.ohiosos.gov/voterlookup.aspx',
  },
  OK: {
    registerUrl: 'https://www.oklahoma.gov/elections/voter-registration/register-to-vote.html',
    checkRegistrationUrl: 'https://okvoterportal.okelections.us/',
  },
  OR: {
    registerUrl: 'https://sos.oregon.gov/voting/Pages/registration.aspx?lang=en',
    checkRegistrationUrl:
      'https://secure.sos.state.or.us/orestar/vr/showVoterSearch.do?lang=eng&source=SOS',
  },
  PA: {
    registerUrl: 'https://www.pavoterservices.pa.gov/Pages/VoterRegistrationApplication.aspx',
    checkRegistrationUrl: 'https://www.pavoterservices.pa.gov/pages/voterregistrationstatus.aspx',
  },
  RI: {
    registerUrl: 'https://vote.sos.ri.gov/Home/RegistertoVote?ActiveFlag=1',
    checkRegistrationUrl: 'https://vote.sos.ri.gov/Home/UpdateVoterRecord?ActiveFlag=0',
  },
  SC: {
    registerUrl: 'https://vrems.scvotes.sc.gov/OVR/Start',
    checkRegistrationUrl: 'https://vrems.scvotes.sc.gov/Voter/Login',
  },
  SD: {
    registerUrl: 'https://sdsos.gov/elections-voting/voting/register-to-vote/default.aspx',
    checkRegistrationUrl: 'https://vip.sdsos.gov/VIPLogin.aspx',
  },
  TN: {
    registerUrl: 'https://ovr.govote.tn.gov/',
    checkRegistrationUrl: 'https://tnmap.tn.gov/voterlookup/',
  },
  TX: {
    registerUrl: 'https://www.votetexas.gov/register-to-vote/index.html',
    checkRegistrationUrl: 'https://teamrv-mvp.sos.texas.gov/MVP/mvp.do',
  },
  UT: {
    registerUrl: 'https://vote.utah.gov/register-to-vote-or-update-your-voter-registration/',
    checkRegistrationUrl:
      'https://votesearch.utah.gov/voter-search/search/search-by-voter/voter-info',
  },
  VT: {
    registerUrl: 'https://sos.vermont.gov/elections/voters/registration/',
    checkRegistrationUrl: 'https://mvp.vermont.gov/',
  },
  VA: {
    registerUrl: 'https://www.elections.virginia.gov/registration/how-to-register/',
    checkRegistrationUrl: 'https://www.elections.virginia.gov/registration/view-your-info/',
  },
  WA: {
    registerUrl: 'https://voter.votewa.gov/portal2023/login.aspx',
    checkRegistrationUrl: 'https://voter.votewa.gov/portal2023/login.aspx',
  },
  WV: {
    registerUrl: 'https://ovr.sos.wv.gov/Register/Landing#Qualifications',
    checkRegistrationUrl: 'https://apps.sos.wv.gov/Elections/voter/amiregisteredtovote',
  },
  WI: {
    registerUrl: 'https://myvote.wi.gov/en-us/Register-To-Vote',
    checkRegistrationUrl: 'https://myvote.wi.gov/en-us/My-Voter-Info',
  },
  WY: {
    registerUrl: 'https://sos.wyo.gov/Elections/State/RegisteringToVote.aspx',
    checkRegistrationUrl: 'https://www.vote.org/am-i-registered-to-vote/',
  },
  AS: {
    registerUrl: 'https://aselectionoffice.gov/node/3',
    checkRegistrationUrl: 'https://aselectionoffice.gov/status.php',
  },
  GU: {
    registerUrl: 'https://gec.guam.gov/index.php/for-voters/for-voters/',
    checkRegistrationUrl: 'https://gec.guam.gov/validate/',
  },
  PR: {
    registerUrl: 'https://ww2.ceepur.org/Home/FAQInformacionalElector',
    checkRegistrationUrl: 'https://consulta.ceepur.org/?ref=voteusa_en',
  },
  VI: {
    registerUrl: 'https://vivote.gov/voters/register-to-vote/',
    checkRegistrationUrl: 'https://vivote.gov/voters/lookup/',
  },
}
