import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import { createDepartment } from '../api/departments-api'
import Auth from '../auth/Auth'

interface CreateDepartmentProps {
  auth: Auth
}

interface CreateDepartmentState {
  name: string
  description: string
  creatingDepartment: boolean
}

export class CreateDepartment extends React.PureComponent<
  CreateDepartmentProps,
  CreateDepartmentState
> {
  state: CreateDepartmentState = {
    name: '',
    description: '',
    creatingDepartment: false
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value })
  }

  handleDescriptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ description: event.target.value })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.name || !this.state.description) {
        alert('Name and description should be provided')
        return
      }

      this.setCreateState(true)
      const department = await createDepartment(this.props.auth.getIdToken(), {
        name: this.state.name,
        description: this.state.description
      })

      console.log('Created department', department)

      alert('Department was created!')
    } catch (e: any) {
      alert('Could not create a department: ' + e.message)
    } finally {
      this.setCreateState(false)
    }
  }

  setCreateState(creatingDepartment: boolean) {
    this.setState({
      creatingDepartment
    })
  }

  render() {
    return (
      <div>
        <h1>Create new department</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Name</label>
            <input
              placeholder="Department name"
              value={this.state.name}
              onChange={this.handleNameChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Description</label>
            <input
              placeholder="Department description"
              value={this.state.description}
              onChange={this.handleDescriptionChange}
            />
          </Form.Field>
          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {
    return (
      <Button loading={this.state.creatingDepartment} type="submit" className="custom-col">
        Create
      </Button>
    )
  }
}
