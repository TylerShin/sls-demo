import { DUMMY_TEST } from "./abTestGlobalValue";
import { dummy } from "./abTestObject";
import { PageType, ActionArea } from "./actionTicket";

export interface UserGroup<N = string> {
  groupName: N;
  weight: number;
}

export interface Test<N = string> {
  name: ABTest;
  userGroup: UserGroup<N>[];
}

export type ABTest = typeof DUMMY_TEST;

export interface SignUpConversionExpTicketContext {
  pageType: PageType;
  actionArea: ActionArea | PageType | null;
  actionLabel: string | null;
  expName?: string;
}

export const LIVE_TESTS: Test[] = [dummy];

function getRandomPool(): { [key: string]: string[] } {
  const randomPool: { [key: string]: string[] } = {};

  LIVE_TESTS.forEach(test => {
    const testGroupWeightedPool: string[] = [];
    test.userGroup.forEach(group => {
      for (let i = 0; i < group.weight; i++) {
        testGroupWeightedPool.push(group.groupName);
      }
    });

    randomPool[test.name] = testGroupWeightedPool;
  });

  return randomPool;
}

const RANDOM_POOL = getRandomPool();

export function getRandomUserGroup(testName: string): string {
  const testGroupWeightedPool = RANDOM_POOL[testName];
  return testGroupWeightedPool[
    Math.floor(Math.random() * testGroupWeightedPool.length)
  ];
}
