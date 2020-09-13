import fs from 'fs';
import harvest from '../src/lib/index.js';
import {PoolManager} from '../src/lib/manager.js';
import {UnderlyingBalances} from '../src/lib/tokens.js';
import * as utils from '../src/lib/utils.js';

const {ethers} = harvest;
const {prettyPosition} = utils;

const INTERVAL = 5 * 60 * 1000; // 5 minutes

const me = process.argv[2];
const infuraId = process.argv[3];

const FILE = `./scripts/bal_logs_${me}.json`;

if (!fs.existsSync(FILE)) {
  fs.writeFileSync(FILE, JSON.stringify({}));
}

/**
 * @param {string} address address
 * @param {string} infuraId infuraId
 */
async function logBalances(address, infuraId) {
  const provider = new ethers.providers.InfuraProvider(
      'homestead',
      infuraId,
  );
  const man = PoolManager.allPastPools(provider);
  const summaries = await man.summary(address);
  const underlyings = await man.underlying(address, true);

  let totalRewards = ethers.BigNumber.from(0);

  const positions = summaries
      .map(prettyPosition)
      .filter((p) => p.earnedRewards !== '0.0' || p.stakedBalance !== '0.0');

  summaries.forEach((pos) => {
    totalRewards = totalRewards.add(pos.summary.earnedRewards);
  });


  // combine all underlying positions
  let aggregateUnderlyings = new UnderlyingBalances();

  underlyings.reduce((acc, next) => {
    return acc.combine(next.underlyingBalances);
  }, aggregateUnderlyings);

  aggregateUnderlyings = aggregateUnderlyings
    .toList()
    .filter((underlying) => !underlying.balance.isZero())
    .map((u) => {
      return {
        name: u.asset.name,
        balance: ethers.utils.formatUnits(u.balance, u.asset.decimals)
      };
    });

  const output = {
    positions,
    underlyings: aggregateUnderlyings,
  };


  const timestamp = Date.now();
  
  console.log('------LOGGING OUTPUT-----');
  console.log(`The time is ${timestamp}`);
  console.table('REWARDS');
  console.table(output.positions);
  console.log(
      `Total claimable rewards: ${ethers.utils.formatEther(totalRewards)}`,
  );
  console.log('');

  console.log('Underlying Positions');
  console.table(output.underlyings);
  console.log('------DUMPING TO FILE-----');

  const history = JSON.parse(fs.readFileSync(FILE, 'utf8'));
  history[String(timestamp)] = output;
  fs.writeFileSync(FILE, JSON.stringify(history));
}

async function tryIt() {
  try {
    await logBalances(me, infuraId);
  } catch (e) { console.log(e) };
}

tryIt()
setInterval(tryIt, INTERVAL);
