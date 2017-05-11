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

import com.smi.dao.UserAndRoleImpl;
import com.smi.model.Usersandroles;
import java.util.List;
import org.springframework.stereotype.Service;

/**
 *
 * @author Nejm
 */
@Service("userAndRoleService")
public class UserAndRoleServiceImpl implements UserAndRoleService {

    UserAndRoleImpl userAndRoleDao = new UserAndRoleImpl();

    @Override
    public List<Usersandroles> findByUser(Long id) {
        return userAndRoleDao.findByUser(id);
    }

    @Override
    public Long add(Usersandroles uar) {
        return userAndRoleDao.add(uar);
    }

    @Override
    public void delete(Usersandroles uar) {
        userAndRoleDao.delete(uar);
    }

    @Override
    public List<Usersandroles> findByRole(Long id) {
        return userAndRoleDao.findByRole(id);
    }

}
