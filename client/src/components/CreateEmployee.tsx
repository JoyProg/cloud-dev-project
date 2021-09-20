import * as React from 'react'
import { Form, Button } from 'semantic-ui-react'
import { createEmployee, uploadFile } from '../api/employee-api'
import Auth from '../auth/Auth'
import dateFormat from 'dateformat'

enum UploadState {
  NoUpload,
  UploadingData,
  UploadingFile,
}

interface CreateEmployeeProps {
  match: {
    params: {
      groupId: string
    }
  }
  auth: Auth
}

interface CreateEmployeeState {
  name: string
  file: any
  uploadState: UploadState
}

export class CreateEmployee extends React.PureComponent<
  CreateEmployeeProps,
  CreateEmployeeState
> {
  state: CreateEmployeeState = {
    name: '',
    file: undefined,
    uploadState: UploadState.NoUpload
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ name: event.target.value })
  }

  handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    console.log('File change', files)
    this.setState({
      file: files[0]
    })
  }

  handleSubmit = async (event: React.SyntheticEvent) => {
    event.preventDefault()

    try {
      if (!this.state.file) {
        alert('File should be selected')
        return
      }

      this.setUploadState(UploadState.UploadingData)
      const createdEmploye = await createEmployee(this.props.auth.getIdToken(), {
        departmentId: this.props.match.params.groupId,
        name: this.state.name,
        employmentDate: this.calculateDueDate()
      })

      console.log('Created employee', createdEmploye)

      this.setUploadState(UploadState.UploadingFile)
      await uploadFile(createdEmploye.uploadUrl, this.state.file)

      alert('Employee was created!')
    } catch (e: any) {
      alert('Could not create an employee: ' + e.message)
    } finally {
      this.setUploadState(UploadState.NoUpload)
    }
  }

  setUploadState(uploadState: UploadState) {
    this.setState({
      uploadState
    })
  }

  render() {
    return (
      <div>
        <h1>Add new employee</h1>

        <Form onSubmit={this.handleSubmit}>
          <Form.Field>
            <label>Name</label>
            <input required
              placeholder="Name"
              value={this.state.name}
              onChange={this.handleNameChange}
            />
          </Form.Field>
          <Form.Field>
            <label>Profile Picture</label>
            <input required
              type="file"
              accept="image/*"
              placeholder="Profile Picture"
              onChange={this.handleFileChange}
            />
          </Form.Field>

          {this.renderButton()}
        </Form>
      </div>
    )
  }

  renderButton() {

    return (
      <div>
        {this.state.uploadState === UploadState.UploadingData && <p>Uploading image metadata</p>}
        {this.state.uploadState === UploadState.UploadingFile && <p>Uploading file</p>}
        <Button
          loading={this.state.uploadState !== UploadState.NoUpload}
          type="submit" className="custom-col"
        >
          Add
        </Button>
      </div>
    )
  }

  calculateDueDate(): string {
    const date = new Date()
    date.setDate(date.getDate() + 7)

    return dateFormat(date, 'yyyy-mm-dd') as string
  }
}
