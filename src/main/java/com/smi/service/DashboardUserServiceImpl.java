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

import com.smi.dao.DashboardUserDao;
import com.smi.model.DashboardUser;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.stereotype.Service;

@Service("dashboardUserService")
public class DashboardUserServiceImpl implements DashboardUserService{

    @Autowired
    @Qualifier("dashboarduserdao")
    DashboardUserDao  dashboardUserDao;
    
    @Override
    public List<DashboardUser> getByUser(String username) {
        return dashboardUserDao.getByUser(username);
    }

    @Override
    public List<DashboardUser> getByRole(String role_name) {
        return dashboardUserDao.getByRole(role_name);
    }

    @Override
    public Long save(DashboardUser dashboard) {
        return dashboardUserDao.save(dashboard);
    }

    @Override
    public void edit(DashboardUser dashboard) {
        dashboardUserDao.edit(dashboard);
    }
    
}
