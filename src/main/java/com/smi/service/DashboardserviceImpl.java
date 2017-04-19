/*
 * Copyright 2017 Nejm.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
package com.smi.service;

import com.smi.dao.DashboardDao;
import com.smi.dao.DashboardUserDao;
import com.smi.dao.UserDao;
import com.smi.dao.UserDaoImpl;
import com.smi.model.Dashboard;
import com.smi.model.DashboardUser;
import java.util.ArrayList;
import java.util.List;
import org.apache.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

/**
 *
 * @author Nejm
 */
@Service("dashboardService")
public class DashboardserviceImpl implements DashboardService {

    final static Logger logger = Logger.getLogger(DashboardserviceImpl.class);

    @Autowired
    @Qualifier("dashboardDao")
    DashboardDao dashboardDao;

    UserDao userDao = new UserDaoImpl();

    @Autowired
    @Qualifier("dashboarduserdao")
    DashboardUserDao dashboardUserDao;

    @Override
    public List<Dashboard> getDashboards(String username) {
        List<Dashboard> dashboards = new ArrayList<Dashboard>();
        List<String> roles = userDao.findRoles(userDao.findByUsername(username).getUserId());

        List<DashboardUser> dashboarduserList = dashboardUserDao.getByUser(username);
        List<Dashboard> dashboardrole = new ArrayList<Dashboard>();
        for (DashboardUser dashboardUser : dashboarduserList) {
            dashboards.add(dashboardDao.getDashboard(dashboardUser.getIdDashboard()));
        }
        for (String role : roles) {
            List<DashboardUser> dashboardRoleList = dashboardUserDao.getByRole(role.substring(5));
            System.out.println("ROLES"+role.substring(5));
            for (DashboardUser dashboardUser : dashboardRoleList) {
                dashboards.add(dashboardDao.getDashboard(dashboardUser.getIdDashboard()));
            }
        }
        return dashboards;
    }

    @Override
    public Long save(Dashboard dashboard) {
        System.out.println("com.smi.service.DashboardserviceImpl.save()"+dashboard);
        //return 1l;
        return dashboardDao.save(dashboard);
    }

    @Override
    public Dashboard getDashboard(Long id) {
        return dashboardDao.getDashboard(id);
    }

}
