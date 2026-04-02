import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

function loadProcessedTasks() {
  try {
    const data = fs.readFileSync("processed.json");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function saveProcessedTasks(tasks) {
  fs.writeFileSync("processed.json", JSON.stringify(tasks, null, 2));
}

// ✅ NEW: due date helper
function getNextDate(dayName) {
  const days = {
    Sunday: 0,
    Monday: 1,
    Tuesday: 2,
    Wednesday: 3,
    Thursday: 4,
    Friday: 5,
    Saturday: 6,
  };

  const today = new Date();
  const todayDay = today.getDay();
  const targetDay = days[dayName];

  let diff = targetDay - todayDay;
  if (diff <= 0) diff += 7;

  const targetDate = new Date();
  targetDate.setDate(today.getDate() + diff);

  return targetDate.toISOString().split("T")[0];
}

const ROUTES = [
  { keywords: ["nomad"], project: "Unlikely Nomads", day: "Monday" },
  { keywords: ["stock"], project: "Stock", day: "Tuesday" },
  { keywords: ["probashi"], project: "Probashi", day: "Wednesday" },
  { keywords: ["cmo"], project: "Fractional CMO", day: "Thursday" },
  { keywords: ["app", "ai"], project: "App", day: "Friday" },
];

function detectRoute(taskName) {
  const text = taskName.toLowerCase();

  for (const route of ROUTES) {
    for (const keyword of route.keywords) {
      if (text.includes(keyword)) {
        return route;
      }
    }
  }

  return null;
}

async function getProjects(token, workspaceId) {
  const res = await fetch(
    `https://app.asana.com/api/1.0/projects?workspace=${workspaceId}&opt_fields=name`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const data = await res.json();

  const map = {};
  data.data.forEach((project) => {
    map[project.name] = project.gid;
  });

  return map;
}

async function getMyTasks() {
  const token = process.env.ASANA_API_KEY;

  // 1. Get user
  const userRes = await fetch("https://app.asana.com/api/1.0/users/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const userData = await userRes.json();
  const userId = userData.data.gid;

  console.log("User ID:", userId);

  // 2. Get workspace
  const workspaceRes = await fetch(
    `https://app.asana.com/api/1.0/users/${userId}/workspaces`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const workspaceData = await workspaceRes.json();
  const workspaceId = workspaceData.data[0].gid;

  console.log("Workspace ID:", workspaceId);

  // 3. Get project map
  const projectMap = await getProjects(token, workspaceId);
  console.log("Project Map:", projectMap);

  // 4. Get tasks
  const tasksRes = await fetch(
    `https://app.asana.com/api/1.0/tasks?assignee=${userId}&workspace=${workspaceId}&opt_fields=name,due_on`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const tasksData = await tasksRes.json();
  console.log("Total tasks:", tasksData.data?.length || 0);

  const processed = loadProcessedTasks();

  // ✅ FIXED: use for...of (not forEach)
  for (const task of tasksData.data || []) {
    if (processed.includes(task.gid)) continue;

    const route = detectRoute(task.name);

    if (!route) {
      console.log("No matching project for:", task.name);
      processed.push(task.gid);
      continue;
    }

    console.log("NEW TASK:", task.name);
    console.log("→ Project:", route.project);
    console.log("→ Day:", route.day);

    const projectId = projectMap[route.project];

    console.log("Project ID:", projectId);

    if (!projectId) {
      console.log("Project not found:", route.project);
      processed.push(task.gid);
      continue;
    }

    const dueDate = getNextDate(route.day);

    // 1. Add to project
    await fetch(`https://app.asana.com/api/1.0/tasks/${task.gid}/addProject`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          project: projectId,
        },
      }),
    });

    // 2. Set due date
    await fetch(`https://app.asana.com/api/1.0/tasks/${task.gid}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data: {
          due_on: dueDate,
        },
      }),
    });

    processed.push(task.gid);
  }

  saveProcessedTasks(processed);
}

getMyTasks();