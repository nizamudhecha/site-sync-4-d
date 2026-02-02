import React, { useEffect, useState } from "react";
import apiClient from "../../utils/api";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";

import {
  FolderKanban,
  CheckCircle,
  Users,
  AlertCircle,
  Calendar,
} from "lucide-react";

const AdminHome = () => {
  const [stats, setStats] = useState(null);
  const [recentProjects, setRecentProjects] = useState([]);
  const [upcomingSchedules, setUpcomingSchedules] = useState([]);

  // ✅ Load sab kuch
  useEffect(() => {
    fetchStats();
    fetchRecentProjects();
    fetchUpcomingSchedules();
  }, []);

  // ✅ Fetch Admin Stats
  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/stats/admin");
      setStats(response.data);
    } catch (error) {
      console.error("Stats fetch nahi hua:", error);
    }
  };

  // ✅ Fetch Recent Projects
  const fetchRecentProjects = async () => {
    try {
      const response = await apiClient.get("/projects");
      setRecentProjects(response.data.slice(0, 5));
    } catch (error) {
      console.error("Projects fetch nahi hua:", error);
    }
  };

  // ✅ Fetch Upcoming Schedules
  const fetchUpcomingSchedules = async () => {
    try {
      // Step 1: Admin ke projects nikal lo
      const projectRes = await apiClient.get("/projects");
      const myProjects = projectRes.data;

      // Step 2: Har project ke schedules fetch karo
      let allSchedules = [];

      for (let project of myProjects) {
        const scheduleRes = await apiClient.get(
          `/projects/${project.project_id}/schedules`,
        );

        // Project name attach karo display ke liye
        const schedulesWithProject = scheduleRes.data.map((s) => ({
          ...s,
          project_name: project.name,
        }));

        allSchedules = [...allSchedules, ...schedulesWithProject];
      }

      // Step 3: Sirf upcoming phases rakho
      const upcoming = allSchedules
        .filter((s) => new Date(s.start_date) >= new Date())
        .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
        .slice(0, 5);

      setUpcomingSchedules(upcoming);
    } catch (error) {
      console.error("Schedules fetch nahi hua:", error);
    }
  };

  // ✅ Loading
  if (!stats) {
    return <div className="text-slate-600">Loading dashboard...</div>;
  }

  // ✅ Stat Cards Data
  const statCards = [
    {
      title: "Total Projects",
      value: stats.total_projects,
      icon: FolderKanban,
      color: "text-slate-900",
      bgColor: "bg-slate-100",
    },
    {
      title: "Ongoing Projects",
      value: stats.ongoing_projects,
      icon: Calendar,
      color: "text-orange-600",
      bgColor: "bg-orange-100",
    },
    {
      title: "Completed",
      value: stats.completed_projects,
      icon: CheckCircle,
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      title: "Engineers",
      value: stats.total_engineers,
      icon: Users,
      color: "text-sky-600",
      bgColor: "bg-sky-100",
    },
    {
      title: "Pending Approvals",
      value: stats.pending_approvals,
      icon: AlertCircle,
      color: "text-red-600",
      bgColor: "bg-red-100",
    },
  ];

  return (
    <div className="space-y-8" data-testid="admin-home-page">
      {/* ✅ Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="border-slate-200 rounded-md technical-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div
                    className={`${stat.bgColor} ${stat.color} p-3 rounded-sm`}>
                    <Icon className="w-6 h-6" strokeWidth={1.5} />
                  </div>
                </div>

                <div className="text-3xl font-bold text-slate-900">
                  {stat.value}
                </div>

                <div className="text-xs font-medium uppercase tracking-wider text-slate-600 mt-1">
                  {stat.title}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* ✅ Recent Projects + Upcoming Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ✅ Recent Projects */}
        <Card className="border-slate-200 rounded-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold uppercase tracking-tight">
              Recent Projects
            </CardTitle>
          </CardHeader>

          <CardContent>
            {recentProjects.length === 0 ? (
              <p className="text-sm text-slate-500">
                Abhi koi project nahi hai
              </p>
            ) : (
              <div className="space-y-3">
                {recentProjects.map((project) => (
                  <div
                    key={project.project_id}
                    className="p-3 bg-slate-50 rounded-sm border border-slate-200 space-y-2">
                    {/* ✅ Top Row */}
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="font-semibold text-sm text-slate-900">
                          {project.name}
                        </p>

                        <p className="text-xs text-slate-600">
                          {project.location}
                        </p>
                      </div>

                      {/* ✅ Status */}
                      <span
                        className={`text-xs font-medium px-2 py-1 rounded-sm ${
                          project.status === "Completed"
                            ? "bg-green-100 text-green-700"
                            : project.status === "In Progress"
                              ? "bg-orange-100 text-orange-700"
                              : "bg-slate-200 text-slate-700"
                        }`}>
                        {project.status}
                      </span>
                    </div>

                    {/* ✅ Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600 font-medium">
                          Progress
                        </span>

                        <span className="font-semibold text-orange-600">
                          {project.progress || 0}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                        <div
                          className="h-2 bg-orange-600"
                          style={{
                            width: `${project.progress || 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* ✅ Upcoming Schedules */}
        <Card className="border-slate-200 rounded-md">
          <CardHeader>
            <CardTitle className="text-xl font-semibold uppercase tracking-tight">
              Upcoming Schedule Phases
            </CardTitle>
          </CardHeader>

          <CardContent>
            {upcomingSchedules.length === 0 ? (
              <p className="text-sm text-slate-500">
                Abhi koi upcoming phase nahi hai
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingSchedules.map((schedule) => (
                  <div
                    key={schedule.schedule_id}
                    className="p-3 bg-slate-50 rounded-sm border border-slate-200 space-y-2">
                    <p className="font-semibold text-sm text-slate-900">
                      {schedule.phase_name}
                    </p>

                    <p className="text-xs text-slate-500">
                      Project: {schedule.project_name}
                    </p>

                    <p className="text-xs text-slate-600">
                      {new Date(schedule.start_date).toLocaleDateString()} -{" "}
                      {new Date(schedule.end_date).toLocaleDateString()}
                    </p>

                    {/* ✅ Phase Progress Bar */}
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-600">Phase Progress</span>
                        <span className="font-semibold text-green-600">
                          {schedule.progress || 0}%
                        </span>
                      </div>

                      <div className="w-full bg-gray-200 rounded h-2 overflow-hidden">
                        <div
                          className="h-2 bg-green-600"
                          style={{
                            width: `${schedule.progress || 0}%`,
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default AdminHome;
