import * as React from 'react'
import { Card } from 'semantic-ui-react'
import { Department } from '../types/Department'
import { Link } from 'react-router-dom'

interface DepartmentCardProps {
  department: Department
}

interface DepartmentCardState {
}

export class DepartmentItem extends React.PureComponent<DepartmentCardProps, DepartmentCardState> {

  render() {
    return (
      <Card>
        <Card.Content>
          <Card.Header>
            <Link to={`/employees/${this.props.department.departmentId}`}>{this.props.department.name}</Link>
          </Card.Header>
          <Card.Description>{this.props.department.description}</Card.Description>
        </Card.Content>
      </Card>
    )
  }
}
