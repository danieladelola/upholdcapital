import "dotenv/config";
import { prisma } from '../src/lib/db';

async function main() {
  const plans = [
    {
      name: "Starter Plan",
      price: 5000,
      duration: "monthly",
      features: ["Basic tools", "Limited staking access"],
    },
    {
      name: "Pro Plan",
      price: 10000,
      duration: "monthly",
      features: ["Higher limits", "Faster support", "Extra analytics"],
    },
    {
      name: "Elite Plan",
      price: 15000,
      duration: "monthly",
      features: ["Advanced staking options", "Deeper insights", "VIP features"],
    },
    {
      name: "Titan Plan",
      price: 20000,
      duration: "monthly",
      features: ["Full features", "Maximum rewards", "Early updates", "Personal support"],
    },
  ];

  for (const plan of plans) {
    const existing = await prisma.subscriptionPlan.findFirst({
      where: { name: plan.name },
    });

    if (!existing) {
      await prisma.subscriptionPlan.create({
        data: plan,
      });
      console.log(`Created plan: ${plan.name}`);
    } else {
      console.log(`Plan ${plan.name} already exists`);
    }
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });